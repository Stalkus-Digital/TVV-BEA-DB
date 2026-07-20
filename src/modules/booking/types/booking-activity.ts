export const BookingActivityCategory = {
  STATUS: "status",
  PAYMENTS: "payments",
  NOTES: "notes",
  DOCUMENTS: "documents",
  TRAVELLERS: "travellers",
  EMAILS: "emails",
  SYSTEM: "system",
} as const;

export type BookingActivityCategory = (typeof BookingActivityCategory)[keyof typeof BookingActivityCategory];

export type BookingActivitySource =
  | "audit"
  | "timeline"
  | "status_history"
  | "payment"
  | "note"
  | "document"
  | "traveller"
  | "voucher"
  | "invoice";

export interface BookingActivityEvent {
  id: string;
  category: BookingActivityCategory;
  title: string;
  subtitle: string | null;
  actorUserId: string | null;
  occurredAt: string;
  source: BookingActivitySource;
  eventType: string | null;
  metadata: Record<string, unknown> | null;
}

export interface BookingActivityFilter {
  category?: BookingActivityCategory | "all";
  page?: number;
  pageSize?: number;
}
