"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import type { BookingKind } from "../types";
import { bookingsFeatureService } from "../services/bookings.feature.service";

export function useCancelBookingMutation(kind: BookingKind, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bookingsFeatureService.api.cancel(kind, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(kind, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list({ page: 1 }) });
    },
  });
}
