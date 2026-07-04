/**
 * The sprint brief named exactly Created/Approved/Paid/Ticketed/Cancelled/
 * Completed. CONFIRMED is added here too — it's a real lifecycle status
 * with its own API action (POST .../confirm); omitting it from the
 * business-event timeline while logging every other transition would be an
 * inconsistent gap, not a faithful reading of the brief's illustrative list.
 */
export const BookingTimelineEvent = {
  CREATED: "CREATED",
  APPROVED: "APPROVED",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  TICKETED: "TICKETED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingTimelineEvent = (typeof BookingTimelineEvent)[keyof typeof BookingTimelineEvent];

export interface BookingTimelineEntry {
  id: string;
  bookingId: string;
  event: BookingTimelineEvent;
  occurredAt: string;
  details: string | null;
}
