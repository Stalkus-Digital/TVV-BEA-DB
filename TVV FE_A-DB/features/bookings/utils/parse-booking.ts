import { pickField } from "@/lib/api/envelope";
import type { UnifiedBookingItem } from "@/lib/api/bookings";
import type { BookingDetailData, BookingKind, BookingListItem } from "../types";

function readString(source: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function readNumber(source: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

export function mapBookingListItem(item: UnifiedBookingItem): BookingListItem {
  const payload = item.payload ?? {};
  return {
    kind: item.kind,
    id: item.id,
    title:
      item.title ??
      readString(payload, "title", "name") ??
      `${item.kind} booking`,
    startDate:
      item.startDate ??
      readString(payload, "startDate", "checkIn", "departureDate"),
    status: item.status,
    totalAmount: item.totalAmount ?? item.total ?? readNumber(payload, "totalAmount", "total"),
  };
}

export function parseBookingDetail(
  kind: BookingKind,
  id: string,
  body: unknown,
): BookingDetailData | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const payload =
    (pickField<Record<string, unknown>>(body, "payload") as Record<string, unknown> | null) ??
    record;

  const status = readString(record, "status") ?? "unknown";
  const normalizedStatus = status.toLowerCase();

  return {
    kind,
    id: readString(record, "id") ?? id,
    title:
      readString(record, "title") ??
      readString(payload, "title", "name") ??
      `${kind} booking`,
    status,
    startDate:
      readString(record, "startDate") ??
      readString(payload, "startDate", "checkIn", "departureDate"),
    endDate:
      readString(record, "endDate") ??
      readString(payload, "endDate", "checkOut", "returnDate"),
    totalAmount:
      readNumber(record, "totalAmount", "total") ??
      readNumber(payload, "totalAmount", "total"),
    createdAt: readString(record, "createdAt") ?? readString(payload, "createdAt"),
    guests: readNumber(record, "guests") ?? readNumber(payload, "guests", "pax"),
    reference:
      readString(record, "reference") ??
      readString(payload, "reference", "bookingReference", "pnr"),
    destination: readString(record, "destination") ?? readString(payload, "destination"),
    cancellable: !["cancelled", "canceled", "completed", "refunded"].includes(normalizedStatus),
  };
}
