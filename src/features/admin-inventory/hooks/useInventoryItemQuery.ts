"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchInventoryItem } from "../api/inventory";

export function useInventoryItemQuery(itemId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.inventory.detail(itemId ?? ""),
    queryFn: () => fetchInventoryItem(itemId!),
    enabled: Boolean(itemId),
  });
}
