import type { BookingStatus } from "./booking-status";

/** Generic audit trail of every status transition — distinct from BookingTimeline's curated, named business events (see booking-timeline.ts). */
export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedAt: string;
  note: string | null;
}
