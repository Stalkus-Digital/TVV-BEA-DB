"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEnquiry } from "../api/enquiries";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useEnquiryQuery(id: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.enquiries.detail(id ?? ""),
    queryFn: () => fetchEnquiry(id!),
    enabled: Boolean(id),
  });
}
