"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRevenueChart } from "@/lib/admin-api/dashboard";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useRevenueChart() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.revenueChart,
    queryFn: fetchRevenueChart,
  });
}
