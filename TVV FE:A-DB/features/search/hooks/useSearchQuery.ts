"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import { searchFeatureService } from "../services/search.feature.service";
import type { SearchFilters } from "../types";

export function useSearchQuery(q: string, filters: SearchFilters, options?: { enabled?: boolean }) {
  const trimmed = q.trim();

  return useQuery({
    queryKey: queryKeys.search.results(trimmed, { ...filters }),
    enabled: (options?.enabled ?? true) && trimmed.length >= 2,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = await searchFeatureService.query(trimmed);
      if (!res.ok) throw res.error ?? new ApiError("unknown", "Search failed");
      return res.data;
    },
  });
}
