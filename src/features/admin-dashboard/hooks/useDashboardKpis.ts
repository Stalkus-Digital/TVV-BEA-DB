"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardKpis } from "@/lib/admin-api/dashboard";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useDashboardKpis() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.kpis,
    queryFn: fetchDashboardKpis,
  });
}
