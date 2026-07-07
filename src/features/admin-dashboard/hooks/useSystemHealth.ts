"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSystemHealth } from "@/lib/admin-api/dashboard";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useSystemHealth() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.health,
    queryFn: fetchSystemHealth,
    refetchInterval: 60_000,
  });
}
