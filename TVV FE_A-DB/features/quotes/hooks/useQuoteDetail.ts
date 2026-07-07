"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { quotesFeatureService } from "../services/quotes.feature.service";

export function useQuoteDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: () => quotesFeatureService.api.fetchDetail(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
