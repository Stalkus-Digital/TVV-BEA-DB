import { err, isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ValidationError, type AppError } from "@/shared/errors";
import { PaymentStatus, type BookingPayment } from "../types/booking-payment";
import type { PaymentRepository } from "../repositories/payment.repository";
import { validateRecordPayment } from "../validation/payment.validation";

export interface RecordPaymentOptions {
  /** Max allowed for PAID/PARTIAL-style captures (outstanding balance). */
  maxPayable?: number;
  /** Max allowed for REFUNDED rows (current amountPaid). */
  maxRefundable?: number;
}

/**
 * Thin CRUD over BookingPayment records only — recomputing the aggregate
 * amountPaid/paymentStatus and any resulting Booking.status bump
 * (CONFIRMED → PARTIALLY_PAID/PAID) is orchestration that lives in
 * booking.service.ts, which is the one place already coordinating status
 * transitions, timeline, and status-history together.
 */
export class BookingPaymentService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly payments: PaymentRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>> {
    return this.payments.findByBooking(bookingId);
  }

  async record(
    bookingId: string,
    input: unknown,
    currency: string,
    options: RecordPaymentOptions = {}
  ): Promise<Result<BookingPayment, AppError>> {
    const validated = validateRecordPayment(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    if (value.status === PaymentStatus.REFUNDED) {
      const max = options.maxRefundable ?? Number.POSITIVE_INFINITY;
      if (value.amount > max + 1e-9) {
        return err(new ValidationError(`Refund amount ₹${value.amount} exceeds amount paid ₹${max}`));
      }
    } else if (value.status === PaymentStatus.PAID || value.status === PaymentStatus.PARTIAL) {
      const max = options.maxPayable ?? Number.POSITIVE_INFINITY;
      if (value.amount > max + 1e-9) {
        return err(new ValidationError(`Payment amount ₹${value.amount} exceeds outstanding balance ₹${max}`));
      }
    }

    this.logger.info("Recording booking payment", { bookingId, amount: value.amount, status: value.status });
    return this.payments.create({
      bookingId,
      amount: value.amount,
      currency,
      method: value.method,
      status: value.status,
      reference: value.reference,
      paidAt:
        value.status === PaymentStatus.PAID || value.status === PaymentStatus.REFUNDED
          ? new Date().toISOString()
          : null,
      notes: value.notes,
      createdAt: new Date().toISOString(),
    });
  }
}
