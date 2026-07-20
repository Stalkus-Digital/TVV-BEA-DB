import type { PublicUser } from "@/features/admin-customers/types";
import type { CustomerRelationshipBundle } from "@/features/admin-customers/types";
import type {
  Booking,
  BookingListRow,
  BookingNote,
  BookingPayment,
  BookingStatusHistory,
  BookingTimelineEntry,
  MergedTimelineEvent,
  Traveller,
} from "./types";

export function formatBookingDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatBookingMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

export function resolveCustomerLabel(
  booking: Pick<Booking, "customerId">,
  usersById: Map<string, PublicUser>,
  sourceQuoteNumber?: string
): string {
  if (booking.customerId) {
    const user = usersById.get(booking.customerId);
    if (user) return user.fullName || user.email;
  }
  return sourceQuoteNumber ? `Via ${sourceQuoteNumber}` : "—";
}

/**
 * Website / external bookings still persist product-specific fields in
 * `internalNotes` JSON (see /api/external/bookings). Prefer structured
 * Traveller / Booking fields when present; use this only for display fallbacks.
 */
export interface WebsiteBookingFields {
  contactName?: string;
  email?: string;
  phone?: string;
  guests?: string | number;
  guestCount?: string | number;
  rooms?: string | number;
  checkIn?: string;
  checkOut?: string;
  hotelName?: string;
  roomName?: string;
  startDate?: string;
  activityName?: string;
  location?: string;
  packageName?: string;
  total?: number;
  isExternalWebsiteBooking?: boolean;
  externalBookingType?: string;
  bookingType?: string;
}

export function parseWebsiteBookingFields(internalNotes: string | null | undefined): WebsiteBookingFields | null {
  if (!internalNotes?.trim()) return null;
  try {
    const parsed = JSON.parse(internalNotes) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as WebsiteBookingFields;
  } catch {
    return null;
  }
}

export function resolveBookingContact(booking: Pick<Booking, "internalNotes" | "travellers">, customerLabel?: string) {
  const website = parseWebsiteBookingFields(booking.internalNotes);
  const lead = booking.travellers?.find((t) => t.isLeadTraveller) ?? booking.travellers?.[0];
  return {
    name: lead?.fullName || website?.contactName || customerLabel || "—",
    email: lead?.email || website?.email || "—",
    phone: lead?.phone || website?.phone || "—",
    website,
  };
}

export function enrichBookingRows(bookings: Booking[], usersById: Map<string, PublicUser>): BookingListRow[] {
  return bookings.map((booking) => ({
    ...booking,
    customerLabel: resolveCustomerLabel(booking, usersById, booking.sourceQuoteNumber),
    packageLabel: booking.packageId ?? booking.sourceQuoteNumber,
    travelDate: null,
  }));
}

export function mergeBookingTimeline(
  timeline: BookingTimelineEntry[],
  statusHistory: BookingStatusHistory[],
  payments: BookingPayment[],
  notes: BookingNote[],
  travellers: Traveller[]
): MergedTimelineEvent[] {
  const events: MergedTimelineEvent[] = [
    ...timeline.map((entry) => ({
      id: entry.id,
      kind: "timeline" as const,
      title: entry.event,
      subtitle: entry.details ?? "Business event",
      occurredAt: entry.occurredAt,
    })),
    ...statusHistory.map((entry) => ({
      id: entry.id,
      kind: "status" as const,
      title: `Status: ${entry.fromStatus ?? "—"} → ${entry.toStatus}`,
      subtitle: entry.note ?? "Status change",
      occurredAt: entry.changedAt,
    })),
    ...payments.map((entry) => ({
      id: entry.id,
      kind: "payment" as const,
      title: `Payment ${formatBookingMoney(entry.amount, entry.currency)}`,
      subtitle: `${entry.method ?? "Manual"} · ${entry.status}`,
      occurredAt: entry.paidAt ?? entry.createdAt,
    })),
    ...notes.map((entry) => ({
      id: entry.id,
      kind: "note" as const,
      title: "Note added",
      subtitle: entry.body,
      occurredAt: entry.createdAt,
    })),
    ...travellers.map((entry) => ({
      id: entry.id,
      kind: "traveller" as const,
      title: entry.isLeadTraveller ? "Lead traveller added" : "Traveller added",
      subtitle: entry.fullName,
      occurredAt: entry.createdAt,
    })),
  ];

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function getRelatedRecordsForBooking(
  booking: Booking,
  bundle: CustomerRelationshipBundle | undefined,
  users: PublicUser[]
) {
  const enquiries =
    bundle?.enquiries.filter((item) => {
      if (booking.customerId && item.customerId === booking.customerId) return true;
      return false;
    }) ?? [];

  const quotes =
    bundle?.quotes.filter(
      (item) => item.id === booking.sourceQuoteId || (booking.customerId && item.customerId === booking.customerId)
    ) ?? [];

  const bookings =
    bundle?.bookings.filter(
      (item) => item.id === booking.id || (booking.customerId && item.customerId === booking.customerId)
    ) ?? [];

  return { enquiries, quotes, bookings, customerUserId: booking.customerId };
}

export type BookingProductTab = "ALL" | "HOTEL" | "PACKAGE" | "ACTIVITY";

export function productTabToHasItemKind(tab: BookingProductTab): string | undefined {
  if (tab === "HOTEL") return "HOTEL";
  if (tab === "ACTIVITY") return "ACTIVITY";
  if (tab === "PACKAGE") return "HOLIDAY_OR_PACKAGE";
  return undefined;
}

export function hasItemKindToProductTab(hasItemKind?: string): BookingProductTab {
  if (hasItemKind === "HOTEL") return "HOTEL";
  if (hasItemKind === "ACTIVITY") return "ACTIVITY";
  if (hasItemKind === "HOLIDAY_OR_PACKAGE") return "PACKAGE";
  return "ALL";
}
