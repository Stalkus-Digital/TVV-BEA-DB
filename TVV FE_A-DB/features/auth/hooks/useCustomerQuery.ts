"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api";
import { fetchSession } from "@/lib/api/auth";
import { queryKeys } from "@/shared/lib/query-keys";
import { sessionActions, useAuth } from "../store/session";

export function useCustomerQuery() {
  const { status, hydrated } = useAuth();
  const hasToken = typeof window !== "undefined" && !!getAccessToken();

  return useQuery({
    queryKey: queryKeys.customer.me,
    queryFn: async () => {
      const user = await fetchSession();
      if (!user) throw new Error("Not authenticated");
      sessionActions.setUser(user);
      return user;
    },
    enabled: hydrated && hasToken && status !== "anonymous",
    staleTime: 60_000,
    retry: false,
  });
}

export function useInvalidateCustomer() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.customer.me });
}
