"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "@/lib/admin-api/dashboard";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useRecentActivity() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.activity,
    queryFn: fetchRecentActivity,
  });
}
