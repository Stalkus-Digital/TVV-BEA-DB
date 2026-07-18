"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllDestinations } from "@/features/admin-destinations/api/destinations";
import { fetchAllPackages } from "@/features/admin-packages/api/packages";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchAllInventory } from "../api/inventory";
import {
  applyCatalogDestinationFilter,
  applyCatalogSearch,
  applyCatalogStatusFilter,
  applyCatalogTypeFilter,
  mapDestinationToCatalogRow,
  mapInventoryToCatalogRow,
  mapPackageToCatalogRow,
  paginateCatalog,
  sortCatalog,
} from "../catalog/utils";
import type { CatalogListFilters } from "../catalog/types";
import { isInventoryKind } from "../catalog/constants";

function serializeFilters(filters: CatalogListFilters) {
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

export function useCatalogQuery(filters: CatalogListFilters) {
  const serialized = serializeFilters(filters);

  const destinationsQuery = useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: () => fetchAllDestinations(),
    staleTime: 5 * 60 * 1000,
  });

  const catalogQuery = useQuery({
    queryKey: ["admin", "catalog", "all", serialized] as const,
    queryFn: async () => {
      const destinations = destinationsQuery.data ?? [];
      const destinationsById = new Map(
        destinations.map((d) => [d.id, { id: d.id, name: d.name, slug: d.slug }])
      );

      const kind = filters.kind;
      const needsInventory = !kind || isInventoryKind(kind);
      const needsDestinations = !kind || kind === "DESTINATION";
      const needsPackages = !kind || kind === "PACKAGE";

      const [inventory, packages] = await Promise.all([
        needsInventory
          ? fetchAllInventory(kind && isInventoryKind(kind) ? { kind } : {})
          : Promise.resolve([]),
        needsPackages ? fetchAllPackages() : Promise.resolve([]),
      ]);

      const rows = [
        ...(needsInventory
          ? inventory.map((item) => mapInventoryToCatalogRow(item, destinationsById))
          : []),
        ...(needsDestinations ? destinations.map(mapDestinationToCatalogRow) : []),
        ...(needsPackages
          ? packages.map((pkg) => mapPackageToCatalogRow(pkg, destinationsById))
          : []),
      ];

      let filtered = applyCatalogTypeFilter(rows, filters.kind);
      filtered = applyCatalogSearch(filtered, filters.search);
      filtered = applyCatalogStatusFilter(filtered, filters.status);
      filtered = applyCatalogDestinationFilter(filtered, filters.destinationId);
      const sorted = sortCatalog(filtered, filters.sortBy ?? "updatedAt", filters.sortDir ?? "desc");
      return paginateCatalog(sorted, filters.page ?? 1, filters.pageSize ?? 20);
    },
    enabled: destinationsQuery.isSuccess,
    placeholderData: (previous) => previous,
  });

  return {
    data: catalogQuery.data,
    destinations: destinationsQuery.data ?? [],
    isLoading: catalogQuery.isLoading || destinationsQuery.isLoading,
    isError: catalogQuery.isError || destinationsQuery.isError,
    error: catalogQuery.error ?? destinationsQuery.error,
    isFetching: catalogQuery.isFetching || destinationsQuery.isFetching,
    refetch: async () => {
      await Promise.all([destinationsQuery.refetch(), catalogQuery.refetch()]);
    },
  };
}
