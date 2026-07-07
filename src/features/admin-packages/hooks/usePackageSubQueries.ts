"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  computePackagePrice,
  fetchPackageAvailability,
  fetchPackageDays,
  fetchPackagePreview,
  fetchPackagePricing,
  fetchPackageRules,
  fetchPackageVersions,
} from "../api/packages";

export function usePackagePreviewQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.preview(packageId ?? ""),
    queryFn: () => fetchPackagePreview(packageId!),
    enabled: Boolean(packageId),
  });
}

export function usePackagePricingQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.pricing(packageId ?? ""),
    queryFn: () => fetchPackagePricing(packageId!),
    enabled: Boolean(packageId),
  });
}

export function usePackageComputeQuery(
  packageId: string | null,
  params: { adults: number; children?: { age: number }[]; infants?: number; date?: string } = { adults: 2 }
) {
  return useQuery({
    queryKey: adminQueryKeys.packages.compute(packageId ?? "", params),
    queryFn: () => computePackagePrice(packageId!, params),
    enabled: Boolean(packageId),
  });
}

export function usePackageRulesQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.rules(packageId ?? ""),
    queryFn: () => fetchPackageRules(packageId!),
    enabled: Boolean(packageId),
  });
}

export function usePackageAvailabilityQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.availability(packageId ?? ""),
    queryFn: () => fetchPackageAvailability(packageId!),
    enabled: Boolean(packageId),
  });
}

export function usePackageDaysQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.days(packageId ?? ""),
    queryFn: () => fetchPackageDays(packageId!),
    enabled: Boolean(packageId),
  });
}

export function usePackageVersionsQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.versions(packageId ?? ""),
    queryFn: () => fetchPackageVersions(packageId!),
    enabled: Boolean(packageId),
  });
}
