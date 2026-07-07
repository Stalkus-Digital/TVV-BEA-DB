"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuotePricing } from "../api/quotes";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useQuotePricingQuery(quoteId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.quotes.pricing(quoteId ?? ""),
    queryFn: () => fetchQuotePricing(quoteId!),
    enabled: Boolean(quoteId),
  });
}
