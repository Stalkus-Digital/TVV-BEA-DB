"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { packagesFeatureService } from "../services/packages.feature.service";

export function usePackageDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.packages.detail(slug),
    queryFn: () => packagesFeatureService.api.fetchBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedPackages(slug: string, limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.packages.detail(slug), "related", limit],
    queryFn: () => packagesFeatureService.api.fetchRelated(slug, limit),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
