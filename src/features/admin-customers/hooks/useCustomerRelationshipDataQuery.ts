"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomerRelationshipBundle } from "../api/relationships";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useCustomerRelationshipDataQuery() {
  return useQuery({
    queryKey: adminQueryKeys.customers.relationshipData,
    queryFn: fetchCustomerRelationshipBundle,
    staleTime: 2 * 60 * 1000,
  });
}
