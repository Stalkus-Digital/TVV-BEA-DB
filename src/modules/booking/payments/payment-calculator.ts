import { PaymentStatus, type BookingPayment } from "../types/booking-payment";

export interface PaymentAggregate {
  amountPaid: number;
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

  let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
  if (amountPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = PaymentStatus.PAID;
  } else if (amountPaid > 0) {
    paymentStatus = PaymentStatus.PARTIAL;
  }

  return { amountPaid, paymentStatus };
}
