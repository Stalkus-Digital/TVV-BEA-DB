"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchCmsDestinations,
  fetchCmsPackages,
  fetchFeaturedDestinations,
  fetchWebsiteHome,
  fetchWebsiteNavigation,
} from "../api/cms";
import { buildDashboardStats } from "../utils";

export function useWebsiteHomeQuery() {
  return useQuery({
    queryKey: adminQueryKeys.cms.home,
    queryFn: fetchWebsiteHome,
  });
}

export function useWebsiteNavigationQuery() {
  return useQuery({
    queryKey: adminQueryKeys.cms.navigation,
    queryFn: fetchWebsiteNavigation,
  });
}

export function useFeaturedDestinationsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.cms.featuredDestinations,
    queryFn: fetchFeaturedDestinations,
  });
}

export function useCmsContentQuery() {
  const homeQuery = useWebsiteHomeQuery();
  const navigationQuery = useWebsiteNavigationQuery();
  const destinationsQuery = useQuery({
    queryKey: adminQueryKeys.cms.destinations,
    queryFn: fetchCmsDestinations,
  });
  const packagesQuery = useQuery({
    queryKey: adminQueryKeys.cms.packages,
    queryFn: fetchCmsPackages,
  });

  const isLoading =
    homeQuery.isLoading ||
    navigationQuery.isLoading ||
    destinationsQuery.isLoading ||
    packagesQuery.isLoading;

  const isError =
    homeQuery.isError ||
    navigationQuery.isError ||
    destinationsQuery.isError ||
    packagesQuery.isError;

  const error =
    homeQuery.error ??
    navigationQuery.error ??
    destinationsQuery.error ??
    packagesQuery.error;

  const stats = buildDashboardStats(
    homeQuery.data,
    navigationQuery.data,
    destinationsQuery.data ?? [],
    packagesQuery.data ?? []
  );

  async function refetchAll() {
    await Promise.all([
      homeQuery.refetch(),
      navigationQuery.refetch(),
      destinationsQuery.refetch(),
      packagesQuery.refetch(),
    ]);
  }

  return {
    home: homeQuery.data,
    navigation: navigationQuery.data,
    destinations: destinationsQuery.data ?? [],
    packages: packagesQuery.data ?? [],
    stats,
    isLoading,
    isError,
    error,
    isFetching:
      homeQuery.isFetching ||
      navigationQuery.isFetching ||
      destinationsQuery.isFetching ||
      packagesQuery.isFetching,
    refetch: refetchAll,
  };
}

export function useInvalidateCmsQueries() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "cms"] });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.destinations.all });
    void queryClient.invalidateQueries({ queryKey: ["admin", "packages", "all"] });
  };
}
