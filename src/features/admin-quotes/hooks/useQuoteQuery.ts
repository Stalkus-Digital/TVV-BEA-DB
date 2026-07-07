"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuote } from "../api/quotes";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useQuoteQuery(quoteId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.quotes.detail(quoteId ?? ""),
    queryFn: () => fetchQuote(quoteId!),
    enabled: Boolean(quoteId),
  });
}
