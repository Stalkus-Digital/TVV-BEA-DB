"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEnquiryNotes } from "../api/enquiries";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useEnquiryNotesQuery(enquiryId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.enquiries.notes(enquiryId ?? ""),
    queryFn: () => fetchEnquiryNotes(enquiryId!),
    enabled: Boolean(enquiryId),
  });
}
