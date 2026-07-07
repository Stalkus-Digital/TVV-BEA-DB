import type { PublicUser } from "@/features/admin-customers/types";
import type { CustomerRelationshipBundle } from "@/features/admin-customers/types";
import type {
  Booking,
  BookingListFilters,
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

export function applyBookingSearch(items: Booking[], search?: string): Booking[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.bookingNumber.toLowerCase().includes(query) ||
      item.sourceQuoteNumber.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
  );
}

export function applyPaymentStatusFilter(items: Booking[], paymentStatus?: string): Booking[] {
  if (!paymentStatus) return items;
  return items.filter((item) => item.paymentStatus === paymentStatus);
}

export function applyBookingDateFilter(items: Booking[], dateFrom?: string, dateTo?: string): Booking[] {
  let result = items;
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    result = result.filter((item) => new Date(item.createdAt).getTime() >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((item) => new Date(item.createdAt).getTime() <= to.getTime());
  }
  return result;
}

export function enrichBookingRows(bookings: Booking[], usersById: Map<string, PublicUser>): BookingListRow[] {
  return bookings.map((booking) => ({
    ...booking,
    customerLabel: resolveCustomerLabel(booking, usersById, booking.sourceQuoteNumber),
    packageLabel: booking.packageId ?? booking.sourceQuoteNumber,
    travelDate: null,
  }));
}

export function sortBookings(
  items: BookingListRow[],
  sortBy: BookingListFilters["sortBy"] = "createdAt",
  sortDir: BookingListFilters["sortDir"] = "desc"
): BookingListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    let left: string | number = 0;
    let right: string | number = 0;
    switch (sortBy) {
      case "bookingNumber":
        left = a.bookingNumber;
        right = b.bookingNumber;
        break;
      case "status":
        left = a.status;
        right = b.status;
        break;
      case "paymentStatus":
        left = a.paymentStatus;
        right = b.paymentStatus;
        break;
      case "totalAmount":
        left = a.totalAmount;
        right = b.totalAmount;
        break;
      case "amountPaid":
        left = a.amountPaid;
        right = b.amountPaid;
        break;
      default:
        left = new Date(a.createdAt).getTime();
        right = new Date(b.createdAt).getTime();
    }
    if (left < right) return -1 * dir;
    if (left > right) return 1 * dir;
    return 0;
  });
}

export function paginateBookings<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function needsClientBookingFiltering(filters: BookingListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.paymentStatus ||
      filters.dateFrom ||
      filters.dateTo ||
      (filters.sortBy && filters.sortBy !== "createdAt") ||
      filters.sortDir === "asc"
  );
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
