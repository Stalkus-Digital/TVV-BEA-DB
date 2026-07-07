"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchDestinationBreadcrumbs,
  fetchDestinationChildren,
  fetchDestinationNearby,
  fetchStates,
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

export function useStatesQuery(countryId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.geography.states(countryId),
    queryFn: () => fetchStates(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60 * 1000,
  });
}
