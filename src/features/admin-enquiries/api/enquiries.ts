import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type { Enquiry, EnquiryListFilters, EnquiryNote, EnquiryStatus, PaginatedEnquiries } from "../types";

function enquiryPath(id: string) {
  return `${adminEndpoints.enquiriesInbox}/${id}`;
}

function notesPath(enquiryId: string, noteId?: string) {
  return noteId ? `${enquiryPath(enquiryId)}/notes/${noteId}` : `${enquiryPath(enquiryId)}/notes`;
}

export async function fetchEnquiries(filters: EnquiryListFilters = {}): Promise<PaginatedEnquiries> {
  const result = await adminApiClient.get<PaginatedResult<Enquiry>>(adminEndpoints.enquiriesInbox, {
    params: {
      status: filters.status,
      type: filters.type,
      assignedToUserId: filters.assignedToUserId,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllEnquiries(
  filters: Omit<EnquiryListFilters, "page" | "pageSize"> = {}
): Promise<Enquiry[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: Enquiry[] = [];

  while (page <= totalPages) {
    const result = await fetchEnquiries({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchEnquiry(id: string): Promise<Enquiry> {
  const result = await adminApiClient.get<Enquiry>(enquiryPath(id));
  if (!result) throw new Error("Enquiry not found");
  return result;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
  const result = await adminApiClient.patch<Enquiry>(`${enquiryPath(id)}/status`, { status });
  if (!result) throw new Error("Failed to update status");
  return result;
}

export async function assignEnquiry(id: string, assignedToUserId: string | null): Promise<Enquiry> {
  const result = await adminApiClient.patch<Enquiry>(`${enquiryPath(id)}/assign`, { assignedToUserId });
  if (!result) throw new Error("Failed to assign enquiry");
  return result;
}

export async function createEnquiry(data: { name: string; email: string; phone?: string; sourceUrl?: string }): Promise<Enquiry> {
  const result = await adminApiClient.post<Enquiry>(adminEndpoints.enquiriesInbox, data);
  if (!result) throw new Error("Failed to create lead");
  return result;
}

export async function deleteEnquiry(id: string): Promise<void> {
  await adminApiClient.delete(enquiryPath(id));
}

export async function fetchEnquiryNotes(enquiryId: string): Promise<EnquiryNote[]> {
  const result = await adminApiClient.get<EnquiryNote[]>(notesPath(enquiryId));
  return result ?? [];
}

export async function createEnquiryNote(enquiryId: string, body: string): Promise<EnquiryNote> {
  const result = await adminApiClient.post<EnquiryNote>(notesPath(enquiryId), { body });
  if (!result) throw new Error("Failed to create note");
  return result;
}

export async function updateEnquiryNote(enquiryId: string, noteId: string, body: string): Promise<EnquiryNote> {
  const result = await adminApiClient.patch<EnquiryNote>(notesPath(enquiryId, noteId), { body });
  if (!result) throw new Error("Failed to update note");
  return result;
}

export async function deleteEnquiryNote(enquiryId: string, noteId: string): Promise<void> {
  await adminApiClient.delete(notesPath(enquiryId, noteId));
}
