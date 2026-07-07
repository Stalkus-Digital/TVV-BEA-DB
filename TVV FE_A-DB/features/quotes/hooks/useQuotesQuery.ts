"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { quotesFeatureService } from "../services/quotes.feature.service";

export function useQuotesQuery() {
  return useQuery({
    queryKey: queryKeys.quotes.all,
    queryFn: () => quotesFeatureService.api.fetchList(),
    staleTime: 60_000,
  });
}
