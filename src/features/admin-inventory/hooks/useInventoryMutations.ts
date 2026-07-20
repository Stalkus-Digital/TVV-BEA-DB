"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  archiveInventoryItem,
  bulkArchiveInventory,
  bulkUpdateInventoryStatus,
  createInventoryItem,
  duplicateInventoryItem,
  publishInventoryItem,
  restoreInventoryItem,
  unpublishInventoryItem,
  updateInventoryItem,
} from "../api/inventory";
import type { CreateInventoryInput, UpdateInventoryInput } from "../types";

function invalidateInventoryQueries(queryClient: ReturnType<typeof useQueryClient>, itemId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
  void queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
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

export function usePublishInventoryMutation(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishInventoryItem(itemId),
    onSuccess: () => invalidateInventoryQueries(queryClient, itemId),
  });
}

export function useUnpublishInventoryMutation(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unpublishInventoryItem(itemId),
    onSuccess: () => invalidateInventoryQueries(queryClient, itemId),
  });
}

export function useRestoreInventoryMutation(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => restoreInventoryItem(itemId),
    onSuccess: () => invalidateInventoryQueries(queryClient, itemId),
  });
}

export function useDuplicateInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => duplicateInventoryItem(itemId),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}

export function useBulkInventoryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => bulkUpdateInventoryStatus(ids, status),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}

export function useBulkArchiveInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkArchiveInventory(ids),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}
