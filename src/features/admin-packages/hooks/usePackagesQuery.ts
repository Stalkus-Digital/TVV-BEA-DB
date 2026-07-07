"use client";

import { useQuery } from "@tanstack/react-query";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchAllPackages, fetchPackages, fetchPricesForPackages } from "../api/packages";
import type { PackageListFilters } from "../types";
import {
  applyPackageSearch,
  enrichPackageRows,
  needsClientPackageFiltering,
  paginatePackages,
  sortPackages,
} from "../utils";

function serializeFilters(filters: PackageListFilters) {
  return {
    status: filters.status ?? "",
    destinationId: filters.destinationId ?? "",
    sourceType: filters.sourceType ?? "",
    search: filters.search ?? "",
    sortBy: filters.sortBy ?? "updatedAt",
    sortDir: filters.sortDir ?? "desc",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

export function usePackagesQuery(filters: PackageListFilters) {
  const serialized = serializeFilters(filters);
  const clientMode = needsClientPackageFiltering(filters);
  const destinationsQuery = useDestinationsQuery();

  return useQuery({
    queryKey: clientMode ? adminQueryKeys.packages.all(serialized) : adminQueryKeys.packages.list(serialized),
    queryFn: async () => {
      const destinations = destinationsQuery.data ?? [];
      const destinationsById = new Map(destinations.map((d) => [d.id, d]));

      if (clientMode) {
        const all = await fetchAllPackages({
          status: filters.status,
          destinationId: filters.destinationId,
          sourceType: filters.sourceType,
        });
        const filtered = applyPackageSearch(all, filters.search);
        const pricesById = await fetchPricesForPackages(filtered);
        const rows = enrichPackageRows(filtered, destinationsById, pricesById);
        const sorted = sortPackages(rows, filters.sortBy ?? "updatedAt", filters.sortDir ?? "desc");
        return paginatePackages(sorted, filters.page ?? 1, filters.pageSize ?? 20);
      }

      const page = await fetchPackages(filters);
      const pricesById = await fetchPricesForPackages(page.items);
      const rows = enrichPackageRows(page.items, destinationsById, pricesById);
      return { ...page, items: rows };
    },
    enabled: destinationsQuery.isSuccess,
    placeholderData: (previous) => previous,
  });
}

export function usePackagesQueryState(filters: PackageListFilters) {
  const packagesQuery = usePackagesQuery(filters);
  const destinationsQuery = useDestinationsQuery();

  const refetch = async () => {
    await Promise.all([destinationsQuery.refetch(), packagesQuery.refetch()]);
  };

  return {
    data: packagesQuery.data,
    destinations: destinationsQuery.data ?? [],
    isLoading: packagesQuery.isLoading || destinationsQuery.isLoading,
    isError: packagesQuery.isError || destinationsQuery.isError,
    error: packagesQuery.error ?? destinationsQuery.error,
    isFetching: packagesQuery.isFetching || destinationsQuery.isFetching,
    refetch,
  };
}
