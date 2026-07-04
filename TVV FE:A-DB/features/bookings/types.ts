import type { BookingKind } from "@/lib/api/bookings";

export const BOOKING_KINDS = ["hotel", "activity", "package", "flight"] as const;

export function isBookingKind(value: string): value is BookingKind {
  return (BOOKING_KINDS as readonly string[]).includes(value);
}

export interface BookingListItem {
  kind: BookingKind;
  id: string;
  title: string;
  startDate: string | null;
  status: string;
  totalAmount: number | null;
}

export interface BookingDetailData {
  kind: BookingKind;
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  totalAmount: number | null;
  createdAt: string | null;
  guests: number | null;
  reference: string | null;
  destination: string | null;
  cancellable: boolean;
}

export type { BookingKind };
