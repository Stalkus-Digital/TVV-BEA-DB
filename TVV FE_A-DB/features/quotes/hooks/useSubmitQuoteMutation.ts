"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QuoteRequestInput } from "@/lib/api/quotes";
import { queryKeys } from "@/shared/lib/query-keys";
import { quotesFeatureService } from "../services/quotes.feature.service";

export function useSubmitQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: QuoteRequestInput) => {
      const res = await quotesFeatureService.submit(input);
      if (!res.ok) throw res.error ?? new Error("Quote submission failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
  });
}
