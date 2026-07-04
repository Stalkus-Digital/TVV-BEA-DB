"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNavigationTree } from "@/lib/api/destinations";
import { queryKeys } from "@/shared/lib/query-keys";

export function useNavigationTree() {
  return useQuery({
    queryKey: queryKeys.destinations.tree,
    queryFn: fetchNavigationTree,
    staleTime: 5 * 60 * 1000,
  });
}
