"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { dashboardFeatureService } from "../services/dashboard.feature.service";

export function useWishlistQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.customer.wishlist,
    queryFn: () => dashboardFeatureService.wishlist.list(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}

export function useWishlistMutations() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (packageSlug: string) => dashboardFeatureService.wishlist.add(packageSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.wishlist });
    },
  });

  const remove = useMutation({
    mutationFn: (packageSlug: string) => dashboardFeatureService.wishlist.remove(packageSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.wishlist });
    },
  });

  return { add, remove };
}
