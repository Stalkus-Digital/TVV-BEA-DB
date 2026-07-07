"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchAllCities,
  fetchAllDestinations,
  fetchAllStates,
  fetchCountries,
  fetchDestinationCategories,
  fetchDestinations,
  fetchRegions,
} from "../api/destinations";
import type { DestinationListFilters } from "../types";
import {
  applyDestinationRegionFilter,
  applyDestinationSearch,
  applyDestinationStatusFilter,
  buildGeographyLookups,
  enrichDestinationRows,
  needsClientDestinationFiltering,
  paginateDestinations,
  sortDestinations,
} from "../utils";

function serializeFilters(filters: DestinationListFilters) {
  return {
    countryId: filters.countryId ?? "",
    stateId: filters.stateId ?? "",
    regionId: filters.regionId ?? "",
    categoryId: filters.categoryId ?? "",
    status: filters.status ?? "",
    search: filters.search ?? "",
    sortBy: filters.sortBy ?? "updatedAt",
    sortDir: filters.sortDir ?? "desc",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

export function useDestinationCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.destinations.categories,
    queryFn: fetchDestinationCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGeographyReferenceQuery() {
  return useQuery({
    queryKey: [
      ...adminQueryKeys.destinations.geography.countries,
      "reference",
    ] as const,
    queryFn: async () => {
      const [countries, states, regions, cities, categories] = await Promise.all([
        fetchCountries(),
        fetchAllStates(),
        fetchRegions(),
        fetchAllCities(),
        fetchDestinationCategories(),
      ]);
      const lookups = buildGeographyLookups(countries, states, regions, cities);
      return {
        countries,
        states,
        regions,
        cities,
        categories,
        categoriesById: new Map(categories.map((c) => [c.id, c])),
        ...lookups,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDestinationsQuery(filters: DestinationListFilters) {
  const serialized = serializeFilters(filters);
  const clientMode = needsClientDestinationFiltering(filters);
  const geoQuery = useGeographyReferenceQuery();
  const categoriesQuery = useDestinationCategoriesQuery();

  return useQuery({
    queryKey: clientMode
      ? [...adminQueryKeys.destinations.all, serialized]
      : adminQueryKeys.destinations.list(serialized),
    queryFn: async () => {
      const geo = geoQuery.data;
      if (!geo) throw new Error("Geography reference not loaded");

      const serverFilters = {
        countryId: filters.countryId,
        stateId: filters.stateId,
        categoryId: filters.categoryId,
      };

      if (clientMode) {
        const all = await fetchAllDestinations(serverFilters);
        let filtered = applyDestinationSearch(all, filters.search);
        filtered = applyDestinationStatusFilter(filtered, filters.status);
        filtered = applyDestinationRegionFilter(filtered, filters.regionId);
        const rows = enrichDestinationRows(
          filtered,
          geo.countriesById,
          geo.statesById,
          geo.regionsById,
          geo.categoriesById
        );
        const sorted = sortDestinations(rows, filters.sortBy ?? "updatedAt", filters.sortDir ?? "desc");
        return paginateDestinations(sorted, filters.page ?? 1, filters.pageSize ?? 20);
      }

      const page = await fetchDestinations(filters);
      const rows = enrichDestinationRows(
        page.items,
        geo.countriesById,
        geo.statesById,
        geo.regionsById,
        geo.categoriesById
      );
      return { ...page, items: rows };
    },
    enabled: geoQuery.isSuccess && categoriesQuery.isSuccess,
    placeholderData: (previous) => previous,
  });
}

export function useDestinationsQueryState(filters: DestinationListFilters) {
  const destinationsQuery = useDestinationsQuery(filters);
  const geoQuery = useGeographyReferenceQuery();

  const refetch = async () => {
    await Promise.all([geoQuery.refetch(), destinationsQuery.refetch()]);
  };

  return {
    data: destinationsQuery.data,
    geo: geoQuery.data,
    isLoading: destinationsQuery.isLoading || geoQuery.isLoading,
    isError: destinationsQuery.isError || geoQuery.isError,
    error: destinationsQuery.error ?? geoQuery.error,
    isFetching: destinationsQuery.isFetching || geoQuery.isFetching,
    refetch,
  };
}
