"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchCountries,
  fetchDestinationBreadcrumbs,
  fetchDestinationCategories,
  fetchDestinationChildren,
  fetchDestinationNearby,
  fetchRegions,
  fetchStates,
  fetchCities,
} from "../api/destinations";

export function useDestinationBreadcrumbsQuery(destinationId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.breadcrumbs(destinationId ?? ""),
    queryFn: () => fetchDestinationBreadcrumbs(destinationId!),
    enabled: Boolean(destinationId),
  });
}

export function useDestinationChildrenQuery(destinationId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.children(destinationId ?? ""),
    queryFn: () => fetchDestinationChildren(destinationId!),
    enabled: Boolean(destinationId),
  });
}

export function useDestinationNearbyQuery(destinationId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.nearby(destinationId ?? ""),
    queryFn: () => fetchDestinationNearby(destinationId!),
    enabled: Boolean(destinationId),
  });
}

export function useDestinationCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.destinations.categories,
    queryFn: () => fetchDestinationCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatesQuery(countryId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.geography.states(countryId),
    queryFn: () => fetchStates(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCountriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.destinations.geography.countries,
    queryFn: () => fetchCountries(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegionsQuery(countryId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.geography.regions(countryId),
    queryFn: () => fetchRegions(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCitiesQuery(countryId?: string, stateId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.geography.cities(countryId, stateId),
    queryFn: () => fetchCities({ countryId, stateId }),
    enabled: Boolean(countryId) || Boolean(stateId),
    staleTime: 5 * 60 * 1000,
  });
}
