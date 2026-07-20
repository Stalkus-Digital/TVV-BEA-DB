import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { getQuoteService } from "@/modules/quote";
import { getSembarkService } from "@/modules/customer";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import { BookingStatus } from "../types/booking-status";
import { PaymentStatus, type BookingPayment } from "../types/booking-payment";
import type { Booking } from "../types/booking";
import type { BookingInvoice } from "../types/booking-invoice";
import type { BookingVoucher } from "../types/booking-voucher";
import { TravellerType } from "../types/traveller";
import type { BookingListFilter, BookingRepository } from "../repositories/booking.repository";
import type { BookingItemRepository } from "../repositories/booking-item.repository";
import type { TravellerRepository } from "../repositories/traveller.repository";
import { canTransition } from "../status/booking-status-machine";
import { computePaymentAggregate, computePaymentSummary } from "../payments/payment-calculator";
import { assessBookingTravellerReadiness } from "../travellers/traveller-completeness";
import { validateCreateBooking, validateCancelBooking, validateUpdateBooking } from "../validation/booking.validation";
import { validateRecordPayment } from "../validation/payment.validation";
import type { BookingPaymentService } from "./booking-payment.service";
import type { BookingStatusHistoryService } from "./booking-status-history.service";
import type { BookingTimelineService } from "./booking-timeline.service";
import type { VoucherService } from "../voucher/voucher.service";
import type { InvoiceService } from "../documents/invoice.service";

const PAYABLE_STATUSES: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_PAID, BookingStatus.PAID];

function generateBookingNumber(sequence: number): string {
  return `BK-${String(sequence).padStart(6, "0")}`;
}

export class BookingService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly bookings: BookingRepository,
    private readonly items: BookingItemRepository,
    private readonly travellers: TravellerRepository,
    private readonly paymentService: BookingPaymentService,
    private readonly statusHistoryService: BookingStatusHistoryService,
    private readonly timelineService: BookingTimelineService,
    private readonly voucherService: VoucherService,
    private readonly invoiceService: InvoiceService,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(
    eventType: AuditEventType,
    booking: Booking,
    actorUserId: string | null,
    details?: Record<string, unknown>
  ) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId,
      details: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        ...details,
      },
    });
  }

  async list(filter: BookingListFilter = {}): Promise<Result<PaginatedResult<Booking>, AppError>> {
    return this.bookings.findByFilter(filter);
  }

  async getById(id: string): Promise<Result<Booking, AppError>> {
    const result = await this.bookings.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Booking "${id}" not found`));
    return ok(result.value);
  }

  async update(id: string, input: unknown, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateUpdateBooking(input);
    if (isErr(validated)) return validated;
    const updated = await this.bookings.update(id, { ...validated.value, updatedAt: new Date().toISOString() });
    if (!isErr(updated)) {
      await this.recordAudit(AuditEventType.BOOKING_UPDATED, updated.value, actorUserId, { changes: validated.value });
    }
    return updated;
  }

  async delete(id: string, actorUserId: string | null = null): Promise<Result<void, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    await this.recordAudit(AuditEventType.BOOKING_DELETED, existing.value, actorUserId, {});
    return this.bookings.delete(id);
  }

  /**
   * The ONLY entry point that creates a Booking from a Quote.
   * Uses buildBookingHandoff (no status change) then completeConversion
   * with the real booking id so Quote.convertedBookingId is always set.
   */
  async createFromQuote(input: unknown, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const validated = validateCreateBooking(input);
    if (isErr(validated)) return validated;
    const { quoteId, internalNotes } = validated.value;

    const quote = await getQuoteService().getById(quoteId);
    if (isErr(quote)) return quote;

    const handoff = await getQuoteService().buildBookingHandoff(quoteId);
    if (isErr(handoff)) return handoff;

    const countResult = await this.bookings.countAll();
    if (isErr(countResult)) return countResult;
    const bookingNumber = generateBookingNumber(countResult.value + 1);

    const now = new Date().toISOString();
    this.logger.info("Creating booking from approved quote", { bookingNumber, quoteId });
    const created = await this.bookings.create({
      bookingNumber,
      status: BookingStatus.DRAFT,
      sourceQuoteId: quote.value.id,
      sourceQuoteNumber: quote.value.quoteNumber,
      sourceQuoteVersionId: quote.value.currentVersionId,
      destinationId: quote.value.destinationId,
      packageId: quote.value.packageId,
      currency: handoff.value.pricing.currency,
      totalAmount: handoff.value.pricing.total,
      amountPaid: 0,
      paymentStatus: PaymentStatus.PENDING,
      internalNotes,
      confirmedAt: null,
      ticketedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      customerId: quote.value.customerId,
      createdAt: now,
      updatedAt: now,
    });
    if (isErr(created)) return created;
    const bookingId = created.value.id;

    for (const quoteItem of handoff.value.items) {
      const itemResult = await this.items.create({
        bookingId,
        kind: quoteItem.kind,
        packageId: quoteItem.packageId,
        inventoryItemId: quoteItem.inventoryItemId,
        title: quoteItem.title,
        description: quoteItem.description,
        quantity: quoteItem.quantity,
        unitPrice: quoteItem.unitPrice,
        supplierBookingReference: null,
        createdAt: now,
        updatedAt: now,
      });
      if (isErr(itemResult)) return itemResult;
    }

    const leadTraveller = handoff.value.travelerDetails.leadTraveler;
    const leadResult = await this.travellers.create({
      bookingId,
      type: TravellerType.ADULT,
      isLeadTraveller: true,
      fullName: leadTraveller.name,
      email: leadTraveller.email,
      phone: leadTraveller.phone,
      dateOfBirth: null,
      gender: null,
      nationality: null,
      passportNumber: null,
      passportExpiry: null,
      visaRequired: false,
      emergencyContact: null,
      createdAt: now,
      updatedAt: now,
    });
    if (isErr(leadResult)) return leadResult;

    const linked = await getQuoteService().completeConversion(quoteId, bookingId);
    if (isErr(linked)) {
      this.logger.error("Booking created but quote conversion link failed", {
        bookingId,
        quoteId,
        error: linked.error.message,
      });
      return linked;
    }

    await this.timelineService.record(
      bookingId,
      "APPROVED",
      quote.value.approvedAt ?? now,
      `Source quote ${quote.value.quoteNumber} approved`
    );
    await this.timelineService.record(bookingId, "CREATED", now, `Created from quote ${quote.value.quoteNumber}`);
    await this.statusHistoryService.record(bookingId, null, BookingStatus.DRAFT);

    const finalBooking = await this.getById(bookingId);
    if (!isErr(finalBooking)) {
      await this.recordAudit(AuditEventType.BOOKING_CREATED, finalBooking.value, actorUserId, {
        quoteId,
        quoteNumber: quote.value.quoteNumber,
      });
      getSembarkService().pushBooking(finalBooking.value).catch((pushErr: unknown) => {
        this.logger.error("Failed to push booking to Sembark asynchronously", { err: pushErr, bookingId });
      });
      const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
      enqueueBookingEmail({
        event: BookingEmailEvent.BOOKING_CREATED,
        bookingId,
        actorUserId,
      });
    }

    return finalBooking;
  }

  async confirm(id: string, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.CONFIRMED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be confirmed`));
    }

    const travellers = await this.travellers.findByBooking(id);
    if (isErr(travellers)) return travellers;
    const readiness = assessBookingTravellerReadiness(travellers.value);
    if (!readiness.ready) {
      return err(new ValidationError(readiness.errors.join(". ")));
    }

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, { status: BookingStatus.CONFIRMED, confirmedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;

    await this.statusHistoryService.record(id, booking.value.status, BookingStatus.CONFIRMED);
    await this.timelineService.record(id, "CONFIRMED", now);
    await this.recordAudit(AuditEventType.BOOKING_STATUS_CHANGED, updated.value, actorUserId, {
      changes: { status: { from: booking.value.status, to: BookingStatus.CONFIRMED } },
      travellerCount: readiness.travellerCount,
    });
    const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
    enqueueBookingEmail({
      event: BookingEmailEvent.BOOKING_CONFIRMED,
      bookingId: id,
      actorUserId,
    });
    return updated;
  }

  async cancel(id: string, input: unknown, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.CANCELLED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be cancelled`));
    }
    const validated = validateCancelBooking(input);
    if (isErr(validated)) return validated;

    const hadPayment =
      booking.value.paymentStatus === PaymentStatus.PARTIAL || booking.value.paymentStatus === PaymentStatus.PAID;

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, {
      status: BookingStatus.CANCELLED,
      cancelledAt: now,
      cancellationReason: validated.value.reason,
      updatedAt: now,
    });
    if (isErr(updated)) return updated;

    await this.statusHistoryService.record(id, booking.value.status, BookingStatus.CANCELLED, validated.value.reason);
    await this.timelineService.record(id, "CANCELLED", now, validated.value.reason);
    await this.recordAudit(AuditEventType.BOOKING_CANCELLED, updated.value, actorUserId, {
      reason: validated.value.reason,
      changes: { status: { from: booking.value.status, to: BookingStatus.CANCELLED } },
    });

    const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
    enqueueBookingEmail({
      event: BookingEmailEvent.BOOKING_CANCELLED,
      bookingId: id,
      actorUserId,
      reason: validated.value.reason,
    });

    if (hadPayment) {
      const { getPaymentService } = await import("@/modules/payments/module");
      const refundResult = await getPaymentService().refund(id, {
        reason: `Booking cancelled: ${validated.value.reason}`,
        actorUserId,
      });
      if (isErr(refundResult)) {
        this.logger.error("Automatic refund on cancellation failed — needs manual follow-up", {
          bookingId: id,
          error: refundResult.error.message,
        });
      } else {
        this.logger.info("Automatic refund on cancellation succeeded", {
          bookingId: id,
          refundedAmount: refundResult.value.refundedAmount,
        });
      }
    }

    return this.getById(id);
  }

  async ticket(id: string, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.TICKETED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be ticketed`));
    }

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, { status: BookingStatus.TICKETED, ticketedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;

    await this.statusHistoryService.record(id, booking.value.status, BookingStatus.TICKETED);
    await this.timelineService.record(id, "TICKETED", now);
    await this.recordAudit(AuditEventType.BOOKING_STATUS_CHANGED, updated.value, actorUserId, {
      changes: { status: { from: booking.value.status, to: BookingStatus.TICKETED } },
    });
    return updated;
  }

  async complete(id: string, actorUserId: string | null = null): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.COMPLETED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be completed`));
    }

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, { status: BookingStatus.COMPLETED, completedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;

    await this.statusHistoryService.record(id, booking.value.status, BookingStatus.COMPLETED);
    await this.timelineService.record(id, "COMPLETED", now);
    await this.recordAudit(AuditEventType.BOOKING_STATUS_CHANGED, updated.value, actorUserId, {
      changes: { status: { from: booking.value.status, to: BookingStatus.COMPLETED } },
    });
    return updated;
  }

  async recordPayment(
    id: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<BookingPayment, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;

    const validated = validateRecordPayment(input);
    if (isErr(validated)) return validated;

    const isRefund = validated.value.status === PaymentStatus.REFUNDED;
    const isAdjustment =
      (validated.value.method ?? "").toUpperCase() === "ADJUSTMENT" ||
      (validated.value.notes ?? "").toLowerCase().startsWith("adjustment");

    if (isRefund) {
      if (booking.value.amountPaid <= 0) {
        return err(new ValidationError(`Booking "${id}" has no payment to refund`));
      }
    } else if (!PAYABLE_STATUSES.includes(booking.value.status)) {
      return err(
        new ConflictError(`Booking "${id}" is ${booking.value.status} — payments can only be recorded once CONFIRMED`)
      );
    }

    const outstanding = Math.max(0, booking.value.totalAmount - booking.value.amountPaid);
    const payment = await this.paymentService.record(id, input, booking.value.currency, {
      maxPayable: outstanding,
      maxRefundable: booking.value.amountPaid,
    });
    if (isErr(payment)) return payment;

    const allPayments = await this.paymentService.listByBooking(id);
    if (isErr(allPayments)) return allPayments;
    const aggregate = computePaymentAggregate(booking.value.totalAmount, allPayments.value);

    let nextStatus = booking.value.status;
    if (aggregate.paymentStatus === PaymentStatus.PAID && canTransition(booking.value.status, BookingStatus.PAID)) {
      nextStatus = BookingStatus.PAID;
    } else if (
      aggregate.paymentStatus === PaymentStatus.PARTIAL &&
      canTransition(booking.value.status, BookingStatus.PARTIALLY_PAID)
    ) {
      nextStatus = BookingStatus.PARTIALLY_PAID;
    } else if (
      aggregate.amountPaid === 0 &&
      canTransition(booking.value.status, BookingStatus.CONFIRMED)
    ) {
      // Fully refunded / zeroed — still a valid booking, unpaid
      nextStatus = BookingStatus.CONFIRMED;
    }

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, {
      amountPaid: aggregate.amountPaid,
      paymentStatus: aggregate.paymentStatus,
      status: nextStatus,
      updatedAt: now,
    });
    if (isErr(updated)) return updated;

    if (nextStatus !== booking.value.status) {
      await this.statusHistoryService.record(id, booking.value.status, nextStatus);
      if (nextStatus === BookingStatus.PAID) await this.timelineService.record(id, "PAID", now);
    }

    const auditType = isRefund
      ? AuditEventType.BOOKING_REFUND_RECORDED
      : isAdjustment
        ? AuditEventType.BOOKING_PAYMENT_ADJUSTED
        : AuditEventType.BOOKING_PAYMENT_RECORDED;

    await this.recordAudit(auditType, updated.value, actorUserId, {
      action: isRefund ? "refund recorded" : isAdjustment ? "manual adjustment" : "payment recorded",
      paymentId: payment.value.id,
      amount: payment.value.amount,
      method: payment.value.method,
      status: payment.value.status,
      ...(nextStatus !== booking.value.status
        ? { changes: { status: { from: booking.value.status, to: nextStatus } } }
        : {}),
    });

    if (!isAdjustment) {
      const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
      enqueueBookingEmail({
        event: isRefund ? BookingEmailEvent.REFUND_PROCESSED : BookingEmailEvent.PAYMENT_RECEIVED,
        bookingId: id,
        actorUserId,
        amount: payment.value.amount,
        currency: payment.value.currency,
        dedupeKey: `${isRefund ? "REFUND_PROCESSED" : "PAYMENT_RECEIVED"}:${id}:${payment.value.id}`,
      });
    }

    return payment;
  }

  async getPaymentSummary(id: string) {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    const payments = await this.paymentService.listByBooking(id);
    if (isErr(payments)) return payments;
    return ok(
      computePaymentSummary(booking.value.totalAmount, payments.value, {
        amountPaid: booking.value.amountPaid,
        paymentStatus: booking.value.paymentStatus,
      })
    );
  }

  async generateVoucher(id: string, actorUserId: string | null = null): Promise<Result<BookingVoucher, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    const created = await this.voucherService.generate(booking.value);
    if (!isErr(created)) {
      await this.recordAudit(AuditEventType.BOOKING_VOUCHER_GENERATED, booking.value, actorUserId, {
        voucherId: created.value.id,
        voucherNumber: created.value.voucherNumber,
      });
      const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
      enqueueBookingEmail({
        event: BookingEmailEvent.VOUCHER_GENERATED,
        bookingId: id,
        actorUserId,
        voucherNumber: created.value.voucherNumber,
        dedupeKey: `VOUCHER_GENERATED:${id}:${created.value.id}`,
      });
    }
    return created;
  }

  async generateInvoice(id: string, actorUserId: string | null = null): Promise<Result<BookingInvoice, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    const created = await this.invoiceService.generate(booking.value);
    if (!isErr(created)) {
      await this.recordAudit(AuditEventType.BOOKING_INVOICE_GENERATED, booking.value, actorUserId, {
        invoiceId: created.value.id,
        invoiceNumber: created.value.invoiceNumber,
      });
      const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
      enqueueBookingEmail({
        event: BookingEmailEvent.INVOICE_GENERATED,
        bookingId: id,
        actorUserId,
        invoiceNumber: created.value.invoiceNumber,
        amount: created.value.total,
        currency: created.value.currency,
        dedupeKey: `INVOICE_GENERATED:${id}:${created.value.id}`,
      });
    }
    return created;
  }
}
