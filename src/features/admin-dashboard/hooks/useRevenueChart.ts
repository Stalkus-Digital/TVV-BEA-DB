"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardKpis } from "@/lib/admin-api/dashboard";
import { adminQueryKeys } from "@/shared/lib/query-client";
import type { RevenueMonthPoint } from "@/lib/admin-api/types";

/**
 * Revenue chart is served by GET /api/admin/dashboard/kpis (same payload as KPI cards).
 */
export function useRevenueChart() {
  const query = useQuery({
    queryKey: adminQueryKeys.dashboard.kpis,
    queryFn: fetchDashboardKpis,
  });

  const data = useMemo<RevenueMonthPoint[] | undefined>(
    () => query.data?.revenueChart,
    [query.data?.revenueChart],
  );

  return {
    ...query,
    data,
  };
}
