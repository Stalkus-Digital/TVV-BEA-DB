"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllDestinations } from "../api/quotes";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useDestinationsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: fetchAllDestinations,
    staleTime: 5 * 60 * 1000,
  });
}
