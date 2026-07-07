"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBooking } from "../api/bookings";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useBookingQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.detail(bookingId ?? ""),
    queryFn: () => fetchBooking(bookingId!),
    enabled: Boolean(bookingId),
  });
}
