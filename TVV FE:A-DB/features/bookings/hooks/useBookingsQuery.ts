"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { bookingsFeatureService } from "../services/bookings.feature.service";
import { mapBookingListItem } from "../utils/parse-booking";

export function useBookingsQuery(page = 1) {
  return useQuery({
    queryKey: queryKeys.bookings.list({ page }),
    queryFn: async () => {
      const res = await bookingsFeatureService.list();
      if (!res.ok) throw res.error ?? new Error("Failed to load bookings");
      return {
        items: res.data.items.map(mapBookingListItem),
        counts: res.data.counts,
      };
    },
    staleTime: 60_000,
  });
}
