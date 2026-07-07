import { ok, fail, type ServiceResult } from "@/lib/api";
import {
  fetchBookingDetail,
  fetchMyBookings,
  type BookingKind,
  type MyBookingsPayload,
  type UnifiedBookingItem,
} from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/errors";

export type { BookingKind, UnifiedBookingItem, MyBookingsPayload as MyBookingsResponse };

export const myBookingsService = {
  async list(): Promise<ServiceResult<MyBookingsPayload>> {
    try {
      const data = await fetchMyBookings();
      return ok(data, "live");
    } catch (err) {
      return fail<MyBookingsPayload>(ApiError.fromUnknown(err), "live");
    }
  },

  async get(kind: BookingKind, id: string): Promise<ServiceResult<unknown>> {
    try {
      const data = await fetchBookingDetail(kind, id);
      return ok(data, "live");
    } catch (err) {
      return fail(ApiError.fromUnknown(err), "live");
    }
  },
};

export type MyBookingsService = typeof myBookingsService;
