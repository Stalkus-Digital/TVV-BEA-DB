"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllEnquiries, fetchEnquiries } from "../api/enquiries";
import type { EnquiryListFilters } from "../types";
import { applyClientEnquiryFilters, needsClientFiltering, paginateItems } from "../utils";
import { adminQueryKeys } from "@/shared/lib/query-client";

function serializeFilters(filters: EnquiryListFilters) {
  return {
    status: filters.status ?? "",
    type: filters.type ?? "",
    assignedToUserId: filters.assignedToUserId ?? "",
    search: filters.search ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

export function useEnquiriesQuery(filters: EnquiryListFilters) {
  const serialized = serializeFilters(filters);
  const clientMode = needsClientFiltering(filters);

  return useQuery({
    queryKey: clientMode ? adminQueryKeys.enquiries.all(serialized) : adminQueryKeys.enquiries.list(serialized),
    queryFn: async () => {
      if (clientMode) {
        const all = await fetchAllEnquiries({
          status: filters.status,
          type: filters.type,
          assignedToUserId: filters.assignedToUserId,
        });
        const filtered = applyClientEnquiryFilters(all, filters);
        return paginateItems(filtered, filters.page ?? 1, filters.pageSize ?? 20);
      }
      return fetchEnquiries(filters);
    },
  });
}

export function useAllEnquiriesQuery(filters: Omit<EnquiryListFilters, "page" | "pageSize">) {
  const serialized = serializeFilters({ ...filters, page: 1, pageSize: 100 });

  return useQuery({
    queryKey: adminQueryKeys.enquiries.all(serialized),
    queryFn: async () => {
      const all = await fetchAllEnquiries(filters);
      return applyClientEnquiryFilters(all, filters);
    },
  });
}
