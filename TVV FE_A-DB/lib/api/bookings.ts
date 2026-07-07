import { apiClient } from "./client";
import { endpoints } from "./config";
import { ApiError } from "./errors";

export type BookingKind = "hotel" | "activity" | "package" | "flight";

export interface UnifiedBookingItem {
  kind: BookingKind;
  id: string;
  createdAt: string;
  status: string;
  total: number;
  title?: string;
  startDate?: string | null;
  totalAmount?: number | null;
  payload: Record<string, unknown>;
}

export interface BookingCounts {
  hotel: number;
  activity: number;
  package: number;
  flight: number;
  total: number;
}

export interface MyBookingsPayload {
  items: UnifiedBookingItem[];
  counts: BookingCounts;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  kind?: BookingKind;
}

interface TravelOsBooking {
  id: string;
  bookingNumber: string;
  status: string;
  destinationId: string;
  packageId: string | null;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  confirmedAt: string | null;
  ticketedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TravelOsPaginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Travel OS's Booking entity has no `kind` (hotel/activity/package/flight)
 * distinction — every customer booking here originates from a converted
 * Quote, so `"package"` is used uniformly. The `BookingKind` union stays
 * for UI/routing compatibility (`bookingDetailPath(kind, id)` etc.), not
 * because the backend actually models four separate booking types.
 */
function toUnifiedBookingItem(booking: TravelOsBooking): UnifiedBookingItem {
  return {
    kind: "package",
    id: booking.id,
    createdAt: booking.createdAt,
    status: booking.status,
    total: booking.totalAmount,
    title: booking.bookingNumber,
    startDate: null,
    totalAmount: booking.totalAmount,
    payload: booking as unknown as Record<string, unknown>,
  };
}

/** Real, row-scoped customer bookings — `GET /api/me/bookings`, never another customer's. */
export async function fetchMyBookings(params: BookingListParams = {}): Promise<MyBookingsPayload> {
  if (params.kind && params.kind !== "package") {
    return { items: [], counts: { hotel: 0, activity: 0, package: 0, flight: 0, total: 0 } };
  }

  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("pageSize", String(params.limit));
  const qs = query.toString();

  const body = await apiClient.get<TravelOsPaginated<TravelOsBooking>>(`${endpoints.myBookings.list}${qs ? `?${qs}` : ""}`);
  const items = (body?.items ?? []).map(toUnifiedBookingItem);
  return { items, counts: { hotel: 0, activity: 0, package: items.length, flight: 0, total: items.length } };
}

export async function fetchBookingDetail(_kind: BookingKind, id: string): Promise<unknown | null> {
  return apiClient.get<TravelOsBooking>(endpoints.myBookings.detail(_kind, id), { treat404AsNull: true });
}

/** Travel OS's Customer Bookings API is read-only by design (Customer Experience Platform sprint — "No automatic booking," no self-service cancellation path exists for customers). */
export async function cancelBooking(_kind: BookingKind, _id: string): Promise<void> {
  throw ApiError.notImplemented("Booking cancellation (not available for customers)");
}
