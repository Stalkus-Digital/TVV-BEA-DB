"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchPackage } from "../api/packages";

export function usePackageQuery(packageId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.packages.detail(packageId ?? ""),
    queryFn: () => fetchPackage(packageId!),
    enabled: Boolean(packageId),
  });
}
