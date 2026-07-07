"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "../api/users";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useAllUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.customers.allUsers,
    queryFn: fetchAllUsers,
    staleTime: 2 * 60 * 1000,
  });
}
