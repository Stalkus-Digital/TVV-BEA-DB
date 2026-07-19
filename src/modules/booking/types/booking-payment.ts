export const PaymentStatus = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * One payment-related event against a booking — a manually recorded
 * offline payment (`method`/`reference` are free-text an ops user fills
 * in, e.g. "Bank Transfer", "UPI") or a Razorpay gateway event (`method:
 * "RAZORPAY"`, `reference` is the gateway payment/refund id — see
 * modules/payments/services/payment.service.ts, PAY-001). A REFUNDED row
 * carries a positive `amount` that payment-calculator.ts subtracts back
 * out of the aggregate, it does not store a negative number. `status`
 * here is per-record; Booking.paymentStatus is the aggregate derived from
 * all of a booking's payment rows (see ../payments/payment-calculator.ts).
 */
export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string | null;
  status: PaymentStatus;
  reference: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}
