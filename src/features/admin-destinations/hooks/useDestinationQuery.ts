"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchDestination } from "../api/destinations";

export function useDestinationQuery(destinationId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.destinations.detail(destinationId ?? ""),
    queryFn: () => fetchDestination(destinationId!),
    enabled: Boolean(destinationId),
  });
}
