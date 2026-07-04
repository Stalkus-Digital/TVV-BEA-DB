export const PaymentStatus = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * A manually recorded payment attempt — no gateway is integrated (per this
 * sprint's explicit exclusion), so `method`/`reference` are free-text
 * fields an ops user fills in (e.g. "Bank Transfer", "UPI"), not a gateway
 * transaction ID. `status` here is per-record; Booking.paymentStatus is the
 * aggregate derived from all of a booking's payments (see
 * ../payments/payment-calculator.ts).
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
