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
