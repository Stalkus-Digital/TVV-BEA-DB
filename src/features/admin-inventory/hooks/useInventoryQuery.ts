"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllDestinations } from "@/features/admin-destinations/api/destinations";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchAllInventory, fetchInventory } from "../api/inventory";
import type { InventoryListFilters } from "../types";
import {
  applyInventoryDestinationFilter,
  applyInventorySearch,
  applyInventoryStatusFilter,
  enrichInventoryRows,
  needsClientInventoryFiltering,
  paginateInventory,
  sortInventory,
} from "../utils";

function serializeFilters(filters: InventoryListFilters) {
  return {
    kind: filters.kind ?? "",
    destinationId: filters.destinationId ?? "",
    status: filters.status ?? "",
    search: filters.search ?? "",
    sortBy: filters.sortBy ?? "updatedAt",
    sortDir: filters.sortDir ?? "desc",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

export function useInventoryQuery(filters: InventoryListFilters) {
  const serialized = serializeFilters(filters);
  const clientMode = needsClientInventoryFiltering(filters);

  const destinationsQuery = useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: () => fetchAllDestinations(),
    staleTime: 5 * 60 * 1000,
  });

  return useQuery({
    queryKey: clientMode
      ? adminQueryKeys.inventory.all(serialized)
      : adminQueryKeys.inventory.list(serialized),
    queryFn: async () => {
      const destinations = destinationsQuery.data ?? [];
      const destinationsById = new Map(destinations.map((d) => [d.id, { id: d.id, name: d.name, slug: d.slug }]));

      if (clientMode) {
        const all = await fetchAllInventory({ kind: filters.kind });
        let filtered = applyInventorySearch(all, filters.search);
        filtered = applyInventoryStatusFilter(filtered, filters.status);
        filtered = applyInventoryDestinationFilter(filtered, filters.destinationId);
        const rows = enrichInventoryRows(filtered, destinationsById);
        const sorted = sortInventory(rows, filters.sortBy ?? "updatedAt", filters.sortDir ?? "desc");
        return paginateInventory(sorted, filters.page ?? 1, filters.pageSize ?? 20);
      }

      const page = await fetchInventory(filters);
      const rows = enrichInventoryRows(page.items, destinationsById);
      return { ...page, items: rows };
    },
    enabled: destinationsQuery.isSuccess,
    placeholderData: (previous) => previous,
  });
}

export function useInventoryQueryState(filters: InventoryListFilters) {
  const inventoryQuery = useInventoryQuery(filters);

  const destinationsQuery = useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: () => fetchAllDestinations(),
    staleTime: 5 * 60 * 1000,
  });

  const refetch = async () => {
    await Promise.all([destinationsQuery.refetch(), inventoryQuery.refetch()]);
  };

  return {
    data: inventoryQuery.data,
    destinations: destinationsQuery.data ?? [],
    isLoading: inventoryQuery.isLoading || destinationsQuery.isLoading,
    isError: inventoryQuery.isError || destinationsQuery.isError,
    error: inventoryQuery.error ?? destinationsQuery.error,
    isFetching: inventoryQuery.isFetching || destinationsQuery.isFetching,
    refetch,
  };
}
