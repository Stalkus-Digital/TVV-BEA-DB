export const BookingStatus = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  TICKETED: "TICKETED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  TICKETED: "Ticketed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const DocumentKind = {
  PASSPORT: "PASSPORT",
  VISA: "VISA",
  NATIONAL_ID: "NATIONAL_ID",
  OTHER: "OTHER",
  TICKET: "TICKET",
  INSURANCE: "INSURANCE",
} as const;

export const TravellerType = {
  ADULT: "ADULT",
  CHILD: "CHILD",
  INFANT: "INFANT",
} as const;
