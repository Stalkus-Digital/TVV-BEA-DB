"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuoteItems } from "../api/quotes";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useQuoteItemsQuery(quoteId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.quotes.items(quoteId ?? ""),
    queryFn: () => fetchQuoteItems(quoteId!),
    enabled: Boolean(quoteId),
  });
}
