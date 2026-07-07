"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import type { BookingKind } from "../types";
import { bookingsFeatureService } from "../services/bookings.feature.service";
import { parseBookingDetail } from "../utils/parse-booking";

export function useBookingDetail(kind: BookingKind, id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(kind, id),
    queryFn: async () => {
      const res = await bookingsFeatureService.get(kind, id);
      if (!res.ok) throw res.error ?? new Error("Failed to load booking");
      if (!res.data) throw new Error("Booking not found");
      const parsed = parseBookingDetail(kind, id, res.data);
      if (!parsed) throw new Error("Invalid booking response");
      return parsed;
    },
    enabled: Boolean(kind && id),
    staleTime: 60_000,
  });
}
