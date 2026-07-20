"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDetail } from "../api/users";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useCustomerQuery(userId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.customers.detail(userId ?? ""),
    queryFn: () => fetchCustomerDetail(userId!),
    enabled: Boolean(userId),
  });
}
