import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { getQuoteService } from "@/modules/quote";
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
import { computePaymentAggregate } from "../payments/payment-calculator";
import { validateCreateBooking, validateCancelBooking, validateUpdateBooking } from "../validation/booking.validation";
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
    private readonly invoiceService: InvoiceService
  ) {
    super(context);
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

  async update(id: string, input: unknown): Promise<Result<Booking, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateUpdateBooking(input);
    if (isErr(validated)) return validated;
    return this.bookings.update(id, { ...validated.value, updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    return this.bookings.delete(id);
  }

  /**
   * The ONLY entry point that creates a Booking. Touches Quote exactly
   * once, through Quote's own public convertToBooking() service call — the
   * sanctioned transition Quote itself exposes (requires APPROVED, returns
   * a BookingHandoffPayload). This module never imports a Quote repository
   * and writes zero Quote fields directly; "never modify Quotes" is
   * satisfied at the public-service boundary, the same discipline every
   * other module edge in this project already follows.
   */
  async createFromQuote(input: unknown): Promise<Result<Booking, AppError>> {
    const validated = validateCreateBooking(input);
    if (isErr(validated)) return validated;
    const { quoteId, internalNotes } = validated.value;

    const quote = await getQuoteService().getById(quoteId);
    if (isErr(quote)) return quote;

    const handoff = await getQuoteService().convertToBooking(quoteId);
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

    // Only the lead traveller is seeded — Quote tracked headcounts
    // (adults/children/infants), not individual identities. Remaining
    // travellers must be added via POST /api/bookings/:id/travellers.
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

    await this.timelineService.record(bookingId, "APPROVED", quote.value.approvedAt ?? now, `Source quote ${quote.value.quoteNumber} approved`);
    await this.timelineService.record(bookingId, "CREATED", now, `Created from quote ${quote.value.quoteNumber}`);
    await this.statusHistoryService.record(bookingId, null, BookingStatus.DRAFT);

    return this.getById(bookingId);
  }

  async confirm(id: string): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.CONFIRMED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be confirmed`));
    }

    const now = new Date().toISOString();
    const updated = await this.bookings.update(id, { status: BookingStatus.CONFIRMED, confirmedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;

    await this.statusHistoryService.record(id, booking.value.status, BookingStatus.CONFIRMED);
    await this.timelineService.record(id, "CONFIRMED", now);
    return updated;
  }

  async cancel(id: string, input: unknown): Promise<Result<Booking, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!canTransition(booking.value.status, BookingStatus.CANCELLED)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} and cannot be cancelled`));
    }
    const validated = validateCancelBooking(input);
    if (isErr(validated)) return validated;

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
    return updated;
  }

  /** Not in the literal API list — added because TICKETED is a stated lifecycle status with no other reachable path. */
  async ticket(id: string): Promise<Result<Booking, AppError>> {
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
    return updated;
  }

  /** Not in the literal API list — added because COMPLETED is a stated lifecycle status with no other reachable path. */
  async complete(id: string): Promise<Result<Booking, AppError>> {
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
    return updated;
  }

  /** Recomputes the aggregate paymentStatus/amountPaid from every recorded payment and bumps Booking.status when the status machine allows it (CONFIRMED → PARTIALLY_PAID/PAID). */
  async recordPayment(id: string, input: unknown): Promise<Result<BookingPayment, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    if (!PAYABLE_STATUSES.includes(booking.value.status)) {
      return err(new ConflictError(`Booking "${id}" is ${booking.value.status} — payments can only be recorded once CONFIRMED`));
    }

    const payment = await this.paymentService.record(id, input, booking.value.currency);
    if (isErr(payment)) return payment;

    const allPayments = await this.paymentService.listByBooking(id);
    if (isErr(allPayments)) return allPayments;
    const aggregate = computePaymentAggregate(booking.value.totalAmount, allPayments.value);

    let nextStatus = booking.value.status;
    if (aggregate.paymentStatus === PaymentStatus.PAID && canTransition(booking.value.status, BookingStatus.PAID)) {
      nextStatus = BookingStatus.PAID;
    } else if (aggregate.paymentStatus === PaymentStatus.PARTIAL && canTransition(booking.value.status, BookingStatus.PARTIALLY_PAID)) {
      nextStatus = BookingStatus.PARTIALLY_PAID;
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

    return payment;
  }

  async generateVoucher(id: string): Promise<Result<BookingVoucher, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    return this.voucherService.generate(booking.value);
  }

  async generateInvoice(id: string): Promise<Result<BookingInvoice, AppError>> {
    const booking = await this.getById(id);
    if (isErr(booking)) return booking;
    return this.invoiceService.generate(booking.value);
  }
}
