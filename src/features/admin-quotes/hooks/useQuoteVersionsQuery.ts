"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuoteVersions } from "../api/quotes";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useQuoteVersionsQuery(quoteId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.quotes.versions(quoteId ?? ""),
    queryFn: () => fetchQuoteVersions(quoteId!),
    enabled: Boolean(quoteId),
  });
}
