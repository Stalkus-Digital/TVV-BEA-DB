"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addQuoteItem,
  approveQuote,
  convertQuote,
  createQuote,
  deleteQuoteItem,
  duplicateQuote,
  rejectQuote,
  sendQuote,
  updateQuote,
  updateQuoteItem,
} from "../api/quotes";
import type { CreateQuoteInput, CreateQuoteItemInput, UpdateQuoteInput } from "../types";
import { adminQueryKeys } from "@/shared/lib/query-client";

function invalidateQuoteQueries(queryClient: ReturnType<typeof useQueryClient>, quoteId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "quotes"] });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.relationshipData });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.activity });
  if (quoteId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.quotes.detail(quoteId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.quotes.items(quoteId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.quotes.pricing(quoteId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.quotes.versions(quoteId) });
  }
}

export function useCreateQuoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(input),
    onSuccess: () => invalidateQuoteQueries(queryClient),
  });
}

export function useUpdateQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateQuoteInput) => updateQuote(quoteId, input),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useSendQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changeNote?: string) => sendQuote(quoteId, changeNote),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useApproveQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => approveQuote(quoteId),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useRejectQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => rejectQuote(quoteId, reason),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useDuplicateQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => duplicateQuote(quoteId),
    onSuccess: (quote) => invalidateQuoteQueries(queryClient, quote.id),
  });
}

export function useConvertQuoteMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => convertQuote(quoteId),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useAddQuoteItemMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteItemInput) => addQuoteItem(quoteId, input),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useUpdateQuoteItemMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<CreateQuoteItemInput> }) =>
      updateQuoteItem(quoteId, itemId, input),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}

export function useDeleteQuoteItemMutation(quoteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteQuoteItem(quoteId, itemId),
    onSuccess: () => invalidateQuoteQueries(queryClient, quoteId),
  });
}
