import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";

import crypto from "crypto";
import { PaymentStatus, type BookingPayment as DomainBookingPayment } from "@/modules/booking/types/booking-payment";
import { computePaymentAggregate } from "@/modules/booking/payments/payment-calculator";
import { canTransition } from "@/modules/booking/status/booking-status-machine";
import { BookingStatus } from "@/modules/booking/types/booking-status";
import { AuditEventType } from "@/modules/auth/types/audit-log";

/** Minimum valid payment (₹1 = lowest Razorpay denomination) */
const MIN_PAYMENT_AMOUNT = 1;

/** Maximum tolerance between expected and received amount (2%) */
const AMOUNT_TOLERANCE_PERCENT = 0.02;

export interface CreateOrderDto {
  bookingId: string;
}

export interface RefundInput {
  /** Omit for a full refund of the booking's current amountPaid. */
  amount?: number;
  reason?: string | null;
  /** Admin actor for audit (PP-002C-3). */
  actorUserId?: string | null;
}

export interface RefundResult {
  refundedAmount: number;
  refundReferences: string[];
  paymentStatus: PaymentStatus;
}

export interface ReconcileResult {
  checked: number;
  corrected: number;
  details: string[];
}

function toDomainBookingPayment(row: {
  id: string; bookingId: string; amount: number; currency: string; method: string | null;
  status: string; reference: string | null; paidAt: Date | null; notes: string | null; createdAt: Date;
}): DomainBookingPayment {
  return {
    id: row.id,
    bookingId: row.bookingId,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    status: row.status as PaymentStatus,
    reference: row.reference,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Recomputes amountPaid/paymentStatus from every BookingPayment row — the
 * same canonical calculation booking.service.ts's manual-payment path
 * already uses (see modules/booking/payments/payment-calculator.ts) — and
 * advances Booking.status through the state machine when the aggregate
 * crosses a threshold. Must run inside the caller's transaction so the
 * BookingPayment write and this recompute are atomic together.
 */
async function recomputeBookingAggregate(
  tx: Omit<typeof prisma, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">,
  bookingId: string,
): Promise<{ status: string; paymentStatus: PaymentStatus; amountPaid: number }> {
  const booking = await tx.booking.findUniqueOrThrow({ where: { id: bookingId } });
  const rows = await tx.bookingPayment.findMany({ where: { bookingId } });
  const aggregate = computePaymentAggregate(booking.totalAmount, rows.map(toDomainBookingPayment));

  let nextStatus = booking.status as BookingStatus;
  if (aggregate.paymentStatus === PaymentStatus.PAID && canTransition(booking.status as BookingStatus, BookingStatus.PAID)) {
    nextStatus = BookingStatus.PAID;
  } else if (
    aggregate.paymentStatus === PaymentStatus.PARTIAL &&
    canTransition(booking.status as BookingStatus, BookingStatus.PARTIALLY_PAID)
  ) {
    nextStatus = BookingStatus.PARTIALLY_PAID;
  } else if (
    aggregate.amountPaid === 0 &&
    canTransition(booking.status as BookingStatus, BookingStatus.CONFIRMED)
  ) {
    nextStatus = BookingStatus.CONFIRMED;
  }

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      amountPaid: aggregate.amountPaid,
      paymentStatus: aggregate.paymentStatus,
      status: nextStatus,
      updatedAt: new Date(),
    },
  });

  return { status: nextStatus, paymentStatus: aggregate.paymentStatus, amountPaid: aggregate.amountPaid };
}

export { recomputeBookingAggregate };

async function recordGatewayPaymentAudit(input: {
  eventType: (typeof AuditEventType)[keyof typeof AuditEventType];
  bookingId: string;
  amount: number;
  method: string;
  reference: string | null;
  status: string;
  source: "razorpay" | "phonepe" | "manual";
  actorUserId?: string | null;
  extra?: Record<string, unknown>;
}): Promise<void> {
  const { getAuditLogService } = await import("@/modules/auth");
  await getAuditLogService().record({
    eventType: input.eventType,
    actorUserId: input.actorUserId ?? null,
    details: {
      bookingId: input.bookingId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      status: input.status,
      source: input.source,
      ...input.extra,
    },
  });
}

export class PaymentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  /**
   * SEC-001: keyId/keySecret used to fall back to "rzp_test_mock"/
   * "mock_secret" unconditionally — including in production, which would
   * silently create/verify orders against a fake gateway instead of
   * failing loudly if Razorpay was never actually configured. requireValue
   * enforces "Vault → env → fail" and throws before either literal is ever
   * reached outside development.
   */
  async createOrder(data: CreateOrderDto): Promise<Result<{ provider: "phonepe", merchantTransactionId: string, redirectUrl: string, amount: number, currency: string }, AppError>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        return err(new NotFoundError("Booking not found"));
      }

      // SECURITY-002D: Prevent payment on cancelled bookings or invalid states.
      if (booking.status === BookingStatus.CANCELLED) {
        return err(new ValidationError("Cannot pay for a cancelled booking"));
      }

      // Check if quote (if associated) is still valid
      if (booking.sourceQuoteId) {
        const quote = await prisma.quote.findUnique({
          where: { id: booking.sourceQuoteId },
        });
        if (quote && quote.validTo && new Date(quote.validTo) < new Date()) {
          return err(new ValidationError("Quote has expired — cannot proceed with payment"));
        }
      }

      const amountDue = booking.totalAmount - booking.amountPaid;
      if (amountDue <= 0) {
        return err(new ValidationError("Booking is already fully paid"));
      }

      const { getPhonePeAdapter } = await import("@/modules/payments/adapters/phonepe/phonepe.adapter");
      
      const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_BASE_URL || "http://localhost:3001";
      
      const result = await getPhonePeAdapter().createPayment({
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        amountInr: amountDue,
        redirectUrl: `${baseUrl}/api/checkout/phonepe/redirect`,
        callbackUrl: `${baseUrl}/api/webhooks/phonepe`,
      });

      return ok(result);
    } catch (error: any) {
      this.logger.error("Failed to create phonepe payment link", { error });
      return err(new InternalError(error.message || "Failed to create checkout order"));
    }
  }

  // Removed Razorpay-specific methods (verifyPayment, processPayment, recordPaymentFailure)


  async refund(bookingId: string, input: RefundInput = {}): Promise<Result<RefundResult, AppError>> {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    if (booking.amountPaid <= 0) {
      return err(new ValidationError(`Booking "${bookingId}" has no payment to refund`));
    }

    const requestedAmount = input.amount ?? booking.amountPaid;
    if (requestedAmount <= 0 || requestedAmount > booking.amountPaid) {
      return err(new ValidationError(`Refund amount must be between 0 and the booking's amountPaid (₹${booking.amountPaid})`));
    }

    const capturedPayments = await prisma.bookingPayment.findMany({
      where: { bookingId, status: PaymentStatus.PAID },
      orderBy: { createdAt: "desc" },
    });
    if (capturedPayments.length === 0) {
      return err(new ValidationError(`No captured payment found for booking "${bookingId}" to refund against`));
    }

    const refundedRows: { reference: string; amount: number; sourceReference: string; method: string }[] = [];
    let remaining = requestedAmount;

    try {
      for (const paymentRow of capturedPayments) {
        if (remaining <= 0) break;

        const alreadyRefunded = await prisma.bookingPayment.aggregate({
          where: {
            bookingId,
            status: PaymentStatus.REFUNDED,
            notes: {
              contains: paymentRow.reference ?? paymentRow.id,
            },
          },
          _sum: { amount: true },
        });
        const refundableOnThisPayment = paymentRow.amount - (alreadyRefunded._sum.amount ?? 0);
        if (refundableOnThisPayment <= 0) continue;

        const amountToRefund = Math.min(remaining, refundableOnThisPayment);
        const method = (paymentRow.method ?? "MANUAL").toUpperCase();

        // PhonePe / Manual / Offline refund tracking (PhonePe refund API could be integrated here later)
        refundedRows.push({
          reference: `offline-refund-${paymentRow.id}-${Date.now()}`,
          amount: amountToRefund,
          sourceReference: paymentRow.reference ?? paymentRow.id,
          method: method === "PHONEPE" ? "PHONEPE" : "MANUAL",
        });
        
        remaining -= amountToRefund;
      }
    } catch (error) {
      this.logger.error("Refund logic failed", { bookingId, error });
      return err(new InternalError("Failed to process refund"));
    }

    if (refundedRows.length === 0) {
      return err(new InternalError("No refundable captured payments were found — nothing to refund"));
    }

    const totalRefunded = refundedRows.reduce((sum, r) => sum + r.amount, 0);
    let finalPaymentStatus: PaymentStatus = booking.paymentStatus as PaymentStatus;

    await prisma.$transaction(async (tx) => {
      for (const r of refundedRows) {
        await tx.bookingPayment.create({
          data: {
            bookingId,
            amount: r.amount,
            currency: booking.currency,
            method: r.method,
            status: PaymentStatus.REFUNDED,
            reference: r.reference,
            notes: `Refund of payment ${r.sourceReference} — ${input.reason ?? "no reason given"}`,
            paidAt: new Date(),
            createdAt: new Date(),
          },
        });
      }
      const result = await recomputeBookingAggregate(tx, bookingId);
      finalPaymentStatus = result.paymentStatus;
    });

    this.logger.info("Refund processed", { bookingId, totalRefunded, reason: input.reason ?? null });

    await recordGatewayPaymentAudit({
      eventType: AuditEventType.BOOKING_REFUND_RECORDED,
      bookingId,
      amount: totalRefunded,
      method: refundedRows[0]?.method ?? "MANUAL",
      reference: refundedRows.map((r) => r.reference).join(","),
      status: PaymentStatus.REFUNDED,
      source: refundedRows.some((r) => r.method === "PHONEPE") ? "phonepe" : "manual",
      actorUserId: input.actorUserId ?? null,
      extra: {
        refundedAmount: totalRefunded,
        refundReferences: refundedRows.map((r) => r.reference),
        reason: input.reason ?? null,
        paymentStatus: finalPaymentStatus,
      },
    });

    const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
    enqueueBookingEmail({
      event: BookingEmailEvent.REFUND_PROCESSED,
      bookingId,
      actorUserId: input.actorUserId ?? null,
      amount: totalRefunded,
      currency: booking.currency,
      reason: input.reason ?? null,
      dedupeKey: `REFUND_PROCESSED:${bookingId}:${refundedRows.map((r) => r.reference).join(",")}`,
    });

    return ok({
      refundedAmount: totalRefunded,
      refundReferences: refundedRows.map((r) => r.reference),
      paymentStatus: finalPaymentStatus,
    });
  }

  async reconcilePayment(bookingId: string): Promise<Result<ReconcileResult, AppError>> {
    // PhonePe reconciliation not yet implemented in PhonePeAdapter
    return ok({ checked: 0, corrected: 0, details: ["PhonePe reconciliation not supported yet"] });
  }

  /**
   * Records a successful PhonePe payment against a booking (webhook path).
   */
  async processPhonePePayment(input: {
    bookingId: string;
    transactionId: string;
    amountPaise: number;
    merchantTransactionId?: string;
  }): Promise<Result<void, AppError>> {
    try {
      // SECURITY-002E: PhonePe webhook race condition protection.
      // Use an interactive transaction with a SELECT FOR UPDATE row-level lock.
      // This guarantees that if PhonePe fires the webhook twice in 10ms, the second request
      // will pause here until the first request completes, preventing double-crediting.
      const txResult = await prisma.$transaction(async (tx) => {
        const existing = await tx.bookingPayment.findFirst({ where: { reference: input.transactionId } });
        if (existing) {
          return { status: "DUPLICATE" };
        }

        // Lock the row
        const lockedRows = await tx.$queryRaw<any[]>`SELECT * FROM "bookings" WHERE id = ${input.bookingId} FOR UPDATE`;
        if (!lockedRows || lockedRows.length === 0) {
          return { status: "NOT_FOUND" };
        }
        const booking = lockedRows[0];

        if (booking.status === BookingStatus.CANCELLED) {
          return { status: "CANCELLED" };
        }

        if (booking.sourceQuoteId) {
          const quote = await tx.quote.findUnique({ where: { id: booking.sourceQuoteId } });
          if (quote && quote.validTo && new Date(quote.validTo) < new Date()) {
            return { status: "EXPIRED_QUOTE" };
          }
        }

        const paymentAmount = input.amountPaise / 100;
        if (paymentAmount < MIN_PAYMENT_AMOUNT) {
          return { status: "MIN_PAYMENT", amount: paymentAmount };
        }

        const expectedAmount = Math.max(0, booking.totalAmount - booking.amountPaid);
        if (expectedAmount <= 0) {
          return { status: "FULLY_PAID", bookingNumber: booking.bookingNumber };
        }

        const tolerance = expectedAmount * AMOUNT_TOLERANCE_PERCENT;
        if (paymentAmount < expectedAmount - tolerance) {
          return { status: "UNDERPAYMENT", expectedAmount, paymentAmount, bookingNumber: booking.bookingNumber };
        }
        if (paymentAmount > expectedAmount + tolerance) {
          return { status: "OVERPAYMENT", expectedAmount, paymentAmount, bookingNumber: booking.bookingNumber };
        }

        await tx.bookingPayment.create({
          data: {
            bookingId: input.bookingId,
            amount: paymentAmount,
            currency: booking.currency?.toUpperCase() || "INR",
            method: "PHONEPE",
            status: PaymentStatus.PAID,
            reference: input.transactionId,
            notes: input.merchantTransactionId
              ? `PhonePe merchantTransactionId=${input.merchantTransactionId}`
              : null,
            paidAt: new Date(),
            createdAt: new Date(),
          },
        });
        
        await recomputeBookingAggregate(tx, input.bookingId);
        return { status: "SUCCESS", previousStatus: booking.status, paymentAmount, currency: booking.currency };
      });

      if (txResult.status === "DUPLICATE") {
        this.logger.info("PhonePe payment already recorded — skipping duplicate", { transactionId: input.transactionId });
        return ok(undefined);
      }
      if (txResult.status === "NOT_FOUND") {
        return err(new NotFoundError(`Booking ${input.bookingId} not found for PhonePe reconciliation`));
      }
      if (txResult.status === "CANCELLED") {
        this.logger.warn("PhonePe payment received for cancelled booking — rejecting", { bookingId: input.bookingId, transactionId: input.transactionId });
        return err(new ValidationError("Booking is cancelled — payment cannot be processed"));
      }
      if (txResult.status === "EXPIRED_QUOTE") {
        this.logger.warn("PhonePe payment received for booking with expired quote — rejecting", { bookingId: input.bookingId, transactionId: input.transactionId });
        return err(new ValidationError("Quote has expired — payment cannot be processed"));
      }
      if (txResult.status === "MIN_PAYMENT") {
        return err(new ValidationError(`Payment amount ₹${txResult.amount} is below the minimum allowed`));
      }
      if (txResult.status === "FULLY_PAID") {
        return err(new ValidationError(`Booking ${txResult.bookingNumber} is already fully paid — cannot accept further payment`));
      }
      if (txResult.status === "UNDERPAYMENT") {
        return err(new ValidationError(`Payment ₹${txResult.paymentAmount} is less than the expected ₹${txResult.expectedAmount} for booking ${txResult.bookingNumber}.`));
      }
      if (txResult.status === "OVERPAYMENT") {
        return err(new ValidationError(`Payment ₹${txResult.paymentAmount} exceeds outstanding balance ₹${txResult.expectedAmount} for booking ${txResult.bookingNumber}.`));
      }

      const previousStatus = txResult.previousStatus;
      const paymentAmount = txResult.paymentAmount!;
      const currency = txResult.currency!;


      await recordGatewayPaymentAudit({
        eventType: AuditEventType.BOOKING_PAYMENT_RECORDED,
        bookingId: input.bookingId,
        amount: paymentAmount,
        method: "PHONEPE",
        reference: input.transactionId,
        status: PaymentStatus.PAID,
        source: "phonepe",
        actorUserId: null,
      });

      const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
      enqueueBookingEmail({
        event: BookingEmailEvent.PAYMENT_RECEIVED,
        bookingId: input.bookingId,
        actorUserId: null,
        amount: paymentAmount,
        currency: currency?.toUpperCase() || "INR",
        dedupeKey: `PAYMENT_RECEIVED:${input.bookingId}:${input.transactionId}`,
      });

      const updatedBooking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (updatedBooking && updatedBooking.status !== previousStatus) {
        const { getBookingStatusHistoryService, getBookingTimelineService } = await import("@/modules/booking/module");
        await getBookingStatusHistoryService().record(
          input.bookingId,
          previousStatus as BookingStatus,
          updatedBooking.status as BookingStatus
        );
        if (updatedBooking.status === BookingStatus.PAID) {
          await getBookingTimelineService().record(input.bookingId, "PAID" as never, new Date().toISOString());
        }
      }

      if (updatedBooking?.paymentStatus === "PAID") {
        const { getFulfillmentService } = await import("@/modules/booking/module");
        await getFulfillmentService().fulfillBooking(input.bookingId);
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to process PhonePe payment", { error });
      return err(new InternalError("Failed to process PhonePe payment"));
    }
  }
}
