import { PaymentStatus, type BookingPayment } from "../types/booking-payment";

export interface PaymentAggregate {
  amountPaid: number;
  paymentStatus: PaymentStatus;
}

export interface PaymentSummary {
  totalAmount: number;
  amountPaid: number;
  pendingBalance: number;
  refundedAmount: number;
  paymentStatus: PaymentStatus;
}

/**
 * Pure calculation, no I/O. Only PAID-status records count toward
 * amountPaid — a FAILED attempt or a still-PENDING record must never look
 * like money received. REFUNDED payments are subtracted back out, so a
 * fully refunded booking reads PENDING again rather than staying PAID.
 */
export function computePaymentAggregate(totalAmount: number, payments: BookingPayment[]): PaymentAggregate {
  const amountPaid = payments.reduce((sum, payment) => {
    if (payment.status === PaymentStatus.PAID) return sum + payment.amount;
    if (payment.status === PaymentStatus.REFUNDED) return sum - payment.amount;
    return sum;
  }, 0);

  // Clamp display aggregate — never report negative paid due to over-refund data issues
  const safePaid = Math.max(0, amountPaid);

  let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
  if (safePaid >= totalAmount && totalAmount > 0) {
    paymentStatus = PaymentStatus.PAID;
  } else if (safePaid > 0) {
    paymentStatus = PaymentStatus.PARTIAL;
  } else if (payments.some((p) => p.status === PaymentStatus.FAILED) && safePaid === 0) {
    paymentStatus = PaymentStatus.FAILED;
  }

  return { amountPaid: safePaid, paymentStatus };
}

/** Sum of REFUNDED payment rows (gross refunds recorded). */
export function computeRefundedAmount(payments: BookingPayment[]): number {
  return payments.reduce((sum, payment) => {
    if (payment.status === PaymentStatus.REFUNDED) return sum + payment.amount;
    return sum;
  }, 0);
}

/**
 * Booking payment summary for admin/CRM display — derived from denormalized
 * booking fields plus payment rows for refunded total. Prefer booking.amountPaid
 * when provided so callers don't recompute net paid from scratch.
 */
export function computePaymentSummary(
  totalAmount: number,
  payments: BookingPayment[],
  denormalized?: { amountPaid?: number; paymentStatus?: PaymentStatus }
): PaymentSummary {
  const aggregate = computePaymentAggregate(totalAmount, payments);
  const amountPaid = denormalized?.amountPaid ?? aggregate.amountPaid;
  const paymentStatus = denormalized?.paymentStatus ?? aggregate.paymentStatus;
  const refundedAmount = computeRefundedAmount(payments);
  const pendingBalance = Math.max(0, totalAmount - amountPaid);

  return {
    totalAmount,
    amountPaid,
    pendingBalance,
    refundedAmount,
    paymentStatus,
  };
}
