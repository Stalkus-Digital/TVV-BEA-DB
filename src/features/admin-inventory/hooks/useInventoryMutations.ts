"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { archiveInventoryItem, createInventoryItem, updateInventoryItem } from "../api/inventory";
import type { CreateInventoryInput, UpdateInventoryInput } from "../types";

function invalidateInventoryQueries(queryClient: ReturnType<typeof useQueryClient>, itemId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
  if (itemId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.inventory.detail(itemId) });
  }
}

export function useCreateInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryInput) => createInventoryItem(input),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}

export function useUpdateInventoryMutation(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInventoryInput) => updateInventoryItem(itemId, input),
    onSuccess: () => invalidateInventoryQueries(queryClient, itemId),
  });
}

export function useArchiveInventoryMutation(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => archiveInventoryItem(itemId),
    onSuccess: () => invalidateInventoryQueries(queryClient, itemId),
  });
}
