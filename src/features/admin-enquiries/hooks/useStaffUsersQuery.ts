"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStaffUsers } from "../api/staff";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useStaffUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.staff.users,
    queryFn: fetchStaffUsers,
    staleTime: 5 * 60 * 1000,
  });
}
