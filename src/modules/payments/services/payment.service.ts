import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import Razorpay from "razorpay";
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
  private async getRazorpayClient(): Promise<{ client: Razorpay; keySecret: string; keyId: string }> {
    const { getIntegrationConfigResolver } = await import("@/modules/integrations");
    const resolver = getIntegrationConfigResolver();
    const keyId = (await resolver.requireValue("razorpay", "keyId", "RAZORPAY_KEY_ID", "Razorpay key ID")) || "rzp_test_mock";
    const keySecret = (await resolver.requireValue("razorpay", "keySecret", "RAZORPAY_KEY_SECRET", "Razorpay key secret")) || "mock_secret";
    return {
      client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
      keySecret,
      keyId,
    };
  }

  async createOrder(data: CreateOrderDto): Promise<Result<{ orderId: string, amount: number, currency: string, keyId: string, provider: "razorpay" }, AppError>> {
    try {
      const { getIntegrationConfigResolver } = await import("@/modules/integrations");
      const active = await getIntegrationConfigResolver().getActivePaymentProvider();
      if (active !== "razorpay") {
        return err(new ValidationError("Razorpay is not the active payment gateway"));
      }

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

      const { client, keyId } = await this.getRazorpayClient();
      if (!keyId || keyId === "rzp_test_mock") {
        // Still allow mock in local if explicitly set; warn when missing real keys
        if (!process.env.RAZORPAY_KEY_ID && keyId === "rzp_test_mock") {
          this.logger.warn("Using mock Razorpay credentials");
        }
      }

      const options = {
        amount: Math.round(amountDue * 100),
        currency: booking.currency.toUpperCase(),
        receipt: booking.bookingNumber,
        notes: { bookingId: booking.id },
      };

      const order = await client.orders.create(options);

      return ok({
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
        keyId,
        provider: "razorpay",
      });
    } catch (error) {
      this.logger.error("Failed to create razorpay order", { error });
      return err(new InternalError("Failed to create checkout order"));
    }
  }

  /**
   * Called by the frontend checkout flow. Verifies the order-based signature
   * before processing the payment. Delegates to processPayment() — the same
   * method the webhook calls — so both entry points share one aggregate/
   * state-machine/duplicate-protection implementation instead of two
   * (PAY-001: the old /api/checkout/razorpay/verify route reimplemented
   * this ad hoc, with no amount check, no amountPaid update, and no
   * booking.status transition — fixed by making that route delegate here).
   */
  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): Promise<Result<void, AppError>> {
    const { keySecret } = await this.getRazorpayClient();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    // SECURITY-002D: use timingSafeEqual, not string comparison, to prevent timing attacks.
    // The webhook handler (webhooks/razorpay/route.ts) already does this correctly;
    // this path needed the same protection. Timing-safe comparison prevents an attacker
    // from inferring the correct signature one byte at a time based on response latency.
    try {
      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(signature, "hex"))) {
        this.logger.warn("Payment signature mismatch", { razorpayOrderId, razorpayPaymentId });
        return err(new ValidationError("Invalid payment signature"));
      }
    } catch {
      // If signature is not a valid hex string or lengths differ, treat as invalid.
      this.logger.warn("Payment signature malformed or length mismatch", { razorpayOrderId, razorpayPaymentId });
      return err(new ValidationError("Invalid payment signature"));
    }

    return this.processPayment(razorpayPaymentId);
  }

  /**
   * Fetches the payment from Razorpay and reconciles it with the booking.
   * Called directly by the webhook (which verifies the webhook signature)
   * or by verifyPayment (which verifies the frontend signature).
   */
  async processPayment(razorpayPaymentId: string): Promise<Result<void, AppError>> {
    try {
      // Duplicate-payment guard — covers a retried webhook delivery AND a
      // duplicate frontend verify call for the same Razorpay payment,
      // regardless of which caller reaches this method first.
      const existing = await prisma.bookingPayment.findFirst({ where: { reference: razorpayPaymentId } });
      if (existing) {
        this.logger.info("Payment already recorded — skipping duplicate processing", { razorpayPaymentId });
        return ok(undefined);
      }

      const { client } = await this.getRazorpayClient();
      const payment = await client.payments.fetch(razorpayPaymentId);

      if (payment.status === "captured" || payment.status === "authorized") {
        const bookingId = payment.notes?.bookingId as string;
        if (!bookingId) {
          this.logger.error("Payment captured but no bookingId in notes", { razorpayPaymentId });
          return err(new InternalError("Payment notes missing bookingId — cannot reconcile"));
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
          return err(new NotFoundError(`Booking ${bookingId} not found for payment reconciliation`));
        }

        // SECURITY-002D: Re-validate booking state even during payment processing.
        // This prevents a race where a booking was cancelled between createOrder and payment arrival.
        if (booking.status === BookingStatus.CANCELLED) {
          this.logger.warn("Payment received for cancelled booking — rejecting", { bookingId, razorpayPaymentId });
          return err(new ValidationError("Booking is cancelled — payment cannot be processed"));
        }

        // Re-check quote expiry at payment time
        if (booking.sourceQuoteId) {
          const quote = await prisma.quote.findUnique({ where: { id: booking.sourceQuoteId } });
          if (quote && quote.validTo && new Date(quote.validTo) < new Date()) {
            this.logger.warn("Payment received for booking with expired quote — rejecting", { bookingId, razorpayPaymentId });
            return err(new ValidationError("Quote has expired — payment cannot be processed"));
          }
        }

        const paymentAmount = Number(payment.amount || 0) / 100;

        if (paymentAmount < MIN_PAYMENT_AMOUNT) {
          this.logger.error("Payment amount is below minimum threshold", {
            paymentAmount, razorpayPaymentId, bookingId,
          });
          return err(new ValidationError(`Payment amount ₹${paymentAmount} is below the minimum allowed`));
        }

        const expectedAmount = Math.max(0, booking.totalAmount - booking.amountPaid);
        if (expectedAmount <= 0) {
          this.logger.error("Payment received for fully paid booking — rejecting overpayment", {
            paymentAmount, bookingId, razorpayPaymentId,
          });
          return err(new ValidationError(`Booking ${booking.bookingNumber} is already fully paid — cannot accept further payment`));
        }

        const tolerance = expectedAmount * AMOUNT_TOLERANCE_PERCENT;
        if (paymentAmount < expectedAmount - tolerance) {
          this.logger.error("Payment amount does not match booking expected amount", {
            paymentAmount, expectedAmount, bookingId, razorpayPaymentId,
          });
          return err(new ValidationError(
            `Payment ₹${paymentAmount} is less than the expected ₹${expectedAmount} for booking ${booking.bookingNumber}. Contact support.`
          ));
        }
        if (paymentAmount > expectedAmount + tolerance) {
          this.logger.error("Payment amount exceeds outstanding balance — rejecting overpayment", {
            paymentAmount, expectedAmount, bookingId, razorpayPaymentId,
          });
          return err(new ValidationError(
            `Payment ₹${paymentAmount} exceeds outstanding balance ₹${expectedAmount} for booking ${booking.bookingNumber}.`
          ));
        }

        const previousStatus = booking.status;

        try {
          await prisma.$transaction(async (tx) => {
            await tx.bookingPayment.create({
              data: {
                bookingId,
                amount: paymentAmount,
                currency: payment.currency?.toUpperCase() || "INR",
                method: "RAZORPAY",
                status: PaymentStatus.PAID,
                reference: razorpayPaymentId,
                paidAt: new Date(),
                createdAt: new Date(),
              }
            });

            await recomputeBookingAggregate(tx, bookingId);
          });
        } catch (error: any) {
          // SECURITY-002D: P2002 = unique constraint violation on reference field.
          // Two concurrent calls (webhook retry + frontend verify for the same payment)
          // raced; the first one succeeded and created the payment record, the second
          // one is rejected by the DB constraint itself, not just our app-level check.
          // This is the intended, race-free path — treat it as "already processed".
          if (error?.code === "P2002") {
            this.logger.info("Payment already recorded (caught by DB constraint) — skipping duplicate", { razorpayPaymentId });
            return ok(undefined);
          }
          throw error;
        }

        await recordGatewayPaymentAudit({
          eventType: AuditEventType.BOOKING_PAYMENT_RECORDED,
          bookingId,
          amount: paymentAmount,
          method: "RAZORPAY",
          reference: razorpayPaymentId,
          status: PaymentStatus.PAID,
          source: "razorpay",
          actorUserId: null,
        });

        const updatedBooking = await prisma.booking.findUnique({ where: { id: bookingId } });

        if (updatedBooking && updatedBooking.status !== previousStatus) {
          const { getBookingStatusHistoryService, getBookingTimelineService } = await import("@/modules/booking/module");
          await getBookingStatusHistoryService().record(bookingId, previousStatus as any, updatedBooking.status as any);
          if (updatedBooking.status === BookingStatus.PAID) {
            await getBookingTimelineService().record(bookingId, "PAID" as any, new Date().toISOString());
          }
        }

        const { enqueueBookingEmail, BookingEmailEvent } = await import("@/modules/email");
        enqueueBookingEmail({
          event: BookingEmailEvent.PAYMENT_RECEIVED,
          bookingId,
          actorUserId: null,
          amount: paymentAmount,
          currency: payment.currency?.toUpperCase() || "INR",
          dedupeKey: `PAYMENT_RECEIVED:${bookingId}:${razorpayPaymentId}`,
        });

        if (updatedBooking?.paymentStatus === "PAID") {
          const { getFulfillmentService } = await import("@/modules/booking/module");
          await getFulfillmentService().fulfillBooking(bookingId);
        }
      } else if (payment.status === "failed") {
        await this.recordPaymentFailure(payment.notes?.bookingId as string | undefined, razorpayPaymentId);
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to verify razorpay payment", { error });
      return err(new InternalError("Failed to process payment"));
    }
  }

  /**
   * Records a failed payment attempt against its booking, without
   * clobbering a booking that's already PAID/PARTIAL from a different,
   * earlier-successful attempt (a customer can retry checkout after a
   * decline — the failure must never overwrite a real success).
   */
  async recordPaymentFailure(bookingId: string | undefined, razorpayPaymentId: string): Promise<Result<void, AppError>> {
    if (!bookingId) {
      this.logger.warn("Payment failed but no bookingId in notes — nothing to record against", { razorpayPaymentId });
      return ok(undefined);
    }
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      this.logger.warn("Payment failed for unknown booking", { bookingId, razorpayPaymentId });
      return ok(undefined);
    }

    const existing = await prisma.bookingPayment.findFirst({ where: { reference: razorpayPaymentId } });
    if (existing) {
      this.logger.info("Failed payment already recorded — skipping duplicate", { bookingId, razorpayPaymentId });
      return ok(undefined);
    }

    try {
      await prisma.bookingPayment.create({
        data: {
          bookingId,
          amount: 0,
          currency: booking.currency?.toUpperCase() || "INR",
          method: "RAZORPAY",
          status: PaymentStatus.FAILED,
          reference: razorpayPaymentId,
          notes: "Gateway payment failed",
          paidAt: null,
          createdAt: new Date(),
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        this.logger.info("Failed payment already recorded (DB constraint) — skipping duplicate", { razorpayPaymentId });
        return ok(undefined);
      }
      throw error;
    }

    // Never clobber a booking that already has successful payment from another attempt
    if (booking.paymentStatus !== PaymentStatus.PAID && booking.paymentStatus !== PaymentStatus.PARTIAL) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: PaymentStatus.FAILED, updatedAt: new Date() },
      });
    }

    await recordGatewayPaymentAudit({
      eventType: AuditEventType.BOOKING_PAYMENT_FAILED,
      bookingId,
      amount: 0,
      method: "RAZORPAY",
      reference: razorpayPaymentId,
      status: PaymentStatus.FAILED,
      source: "razorpay",
      actorUserId: null,
    });

    this.logger.warn("Recorded failed payment attempt", { bookingId, razorpayPaymentId });
    return ok(undefined);
  }

  /**
   * Refunds a booking, in full or in part, against its captured Razorpay
   * payment(s). Calls Razorpay first (an external, non-transactional call
   * by nature), then persists the resulting REFUNDED BookingPayment rows
   * and recomputes the aggregate in one transaction. If Razorpay succeeds
   * but the DB write then fails, reconcilePayment() detects and corrects
   * the drift on next run — a refund is never silently lost either way.
   */
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

        if (method === "RAZORPAY" && paymentRow.reference) {
          const { client } = await this.getRazorpayClient();
          const razorpayRefund = await client.payments.refund(paymentRow.reference, {
            amount: Math.round(amountToRefund * 100),
          });
          refundedRows.push({
            reference: razorpayRefund.id,
            amount: amountToRefund,
            sourceReference: paymentRow.reference,
            method: "RAZORPAY",
          });
        } else {
          // Offline / manual / PhonePe (no Razorpay refund API) — record local refund row
          refundedRows.push({
            reference: `offline-refund-${paymentRow.id}-${Date.now()}`,
            amount: amountToRefund,
            sourceReference: paymentRow.reference ?? paymentRow.id,
            method: method === "PHONEPE" ? "PHONEPE" : "MANUAL",
          });
        }
        remaining -= amountToRefund;
      }
    } catch (error) {
      this.logger.error("Refund call failed", { bookingId, error });
      return err(new InternalError("Failed to process refund with payment gateway"));
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
      source: refundedRows.some((r) => r.method === "RAZORPAY") ? "razorpay" : "manual",
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

  /**
   * Re-fetches every Razorpay-referenced payment for a booking and
   * corrects local drift (a captured payment Razorpay shows as refunded
   * that our DB still shows as fully PAID). Read/verify-heavy, write-light
   * — only touches rows where a real mismatch is found.
   */
  async reconcilePayment(bookingId: string): Promise<Result<ReconcileResult, AppError>> {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const rows = await prisma.bookingPayment.findMany({
      where: { bookingId, method: "RAZORPAY", status: PaymentStatus.PAID, reference: { not: null } },
    });

    let checked = 0;
    let corrected = 0;
    const details: string[] = [];

    for (const row of rows) {
      if (!row.reference) continue;
      checked += 1;
      try {
        const { client } = await this.getRazorpayClient();
        const remotePayment = await client.payments.fetch(row.reference);
        const remoteAmount = Number(remotePayment.amount || 0) / 100;
        const remoteRefunded = Number((remotePayment as any).amount_refunded || 0) / 100;

        if (remoteRefunded > 0) {
          const alreadyRecorded = await prisma.bookingPayment.aggregate({
            where: { bookingId, status: PaymentStatus.REFUNDED, notes: { contains: row.reference } },
            _sum: { amount: true },
          });
          const unrecordedRefund = remoteRefunded - (alreadyRecorded._sum.amount ?? 0);
          if (unrecordedRefund > 0.01) {
            await prisma.bookingPayment.create({
              data: {
                bookingId,
                amount: unrecordedRefund,
                currency: row.currency,
                method: "RAZORPAY",
                status: PaymentStatus.REFUNDED,
                reference: `reconcile-${row.reference}-${Date.now()}`,
                notes: `Reconciliation: Razorpay shows a refund of ₹${unrecordedRefund} on ${row.reference} not previously recorded locally`,
                paidAt: new Date(),
                createdAt: new Date(),
              },
            });
            corrected += 1;
            details.push(`Payment ${row.reference}: recorded missing refund of ₹${unrecordedRefund}`);
          }
        } else if (Math.abs(remoteAmount - row.amount) > 0.01) {
          details.push(`Payment ${row.reference}: amount mismatch — local ₹${row.amount}, Razorpay ₹${remoteAmount} (flagged, not auto-corrected — needs manual review)`);
        }
      } catch (error) {
        this.logger.warn("Reconciliation fetch failed for payment", { reference: row.reference, error });
        details.push(`Payment ${row.reference}: could not fetch from Razorpay for reconciliation`);
      }
    }

    if (corrected > 0) {
      await prisma.$transaction(async (tx) => {
        await recomputeBookingAggregate(tx, bookingId);
      });
    }

    return ok({ checked, corrected, details });
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
      const existing = await prisma.bookingPayment.findFirst({ where: { reference: input.transactionId } });
      if (existing) {
        this.logger.info("PhonePe payment already recorded — skipping duplicate", { transactionId: input.transactionId });
        return ok(undefined);
      }

      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking) {
        return err(new NotFoundError(`Booking ${input.bookingId} not found for PhonePe reconciliation`));
      }

      // SECURITY-002D: Prevent payment on cancelled bookings or invalid states (PhonePe path).
      if (booking.status === BookingStatus.CANCELLED) {
        this.logger.warn("PhonePe payment received for cancelled booking — rejecting", { bookingId: input.bookingId, transactionId: input.transactionId });
        return err(new ValidationError("Booking is cancelled — payment cannot be processed"));
      }

      // Re-check quote expiry at payment time
      if (booking.sourceQuoteId) {
        const quote = await prisma.quote.findUnique({ where: { id: booking.sourceQuoteId } });
        if (quote && quote.validTo && new Date(quote.validTo) < new Date()) {
          this.logger.warn("PhonePe payment received for booking with expired quote — rejecting", { bookingId: input.bookingId, transactionId: input.transactionId });
          return err(new ValidationError("Quote has expired — payment cannot be processed"));
        }
      }

      const paymentAmount = input.amountPaise / 100;
      if (paymentAmount < MIN_PAYMENT_AMOUNT) {
        return err(new ValidationError(`Payment amount ₹${paymentAmount} is below the minimum allowed`));
      }

      const expectedAmount = Math.max(0, booking.totalAmount - booking.amountPaid);
      if (expectedAmount <= 0) {
        return err(new ValidationError(`Booking ${booking.bookingNumber} is already fully paid — cannot accept further payment`));
      }

      const tolerance = expectedAmount * AMOUNT_TOLERANCE_PERCENT;
      if (paymentAmount < expectedAmount - tolerance) {
        return err(
          new ValidationError(
            `Payment ₹${paymentAmount} is less than the expected ₹${expectedAmount} for booking ${booking.bookingNumber}.`
          )
        );
      }
      if (paymentAmount > expectedAmount + tolerance) {
        return err(
          new ValidationError(
            `Payment ₹${paymentAmount} exceeds outstanding balance ₹${expectedAmount} for booking ${booking.bookingNumber}.`
          )
        );
      }

      const previousStatus = booking.status;

      try {
        await prisma.$transaction(async (tx) => {
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
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          this.logger.info("PhonePe payment already recorded (DB constraint) — skipping duplicate", {
            transactionId: input.transactionId,
          });
          return ok(undefined);
        }
        throw error;
      }

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
        currency: booking.currency?.toUpperCase() || "INR",
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
