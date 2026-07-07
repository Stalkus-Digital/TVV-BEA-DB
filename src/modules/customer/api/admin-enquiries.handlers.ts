import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import type { Enquiry, EnquiryNote, EnquiryStatus, EnquiryType } from "../types/enquiry";
import { getEnquiryService } from "../module";

export interface ListAdminEnquiriesQuery {
  status?: EnquiryStatus;
  type?: EnquiryType;
  assignedToUserId?: string;
  page?: number;
  pageSize?: number;
}

export async function listAdminEnquiriesHandler(query: ListAdminEnquiriesQuery): Promise<Result<PaginatedResult<Enquiry>, AppError>> {
  return getEnquiryService().list(query);
}

export async function getAdminEnquiryHandler(id: string): Promise<Result<Enquiry, AppError>> {
  return getEnquiryService().getById(id);
}

export async function updateAdminEnquiryStatusHandler(id: string, body: unknown): Promise<Result<Enquiry, AppError>> {
  return getEnquiryService().updateStatus(id, body);
}

export async function assignAdminEnquiryHandler(id: string, body: unknown): Promise<Result<Enquiry, AppError>> {
  return getEnquiryService().assign(id, body);
}

export async function listAdminEnquiryNotesHandler(enquiryId: string): Promise<Result<EnquiryNote[], AppError>> {
  return getEnquiryService().listNotes(enquiryId);
}

export async function addAdminEnquiryNoteHandler(
  enquiryId: string,
  body: unknown,
  context: AuthContext | null
): Promise<Result<EnquiryNote, AppError>> {
  return getEnquiryService().addNote(enquiryId, body, context?.userId ?? null);
}

export async function updateAdminEnquiryNoteHandler(
  enquiryId: string,
  noteId: string,
  body: unknown
): Promise<Result<EnquiryNote, AppError>> {
  return getEnquiryService().updateNote(enquiryId, noteId, body);
}

export async function deleteAdminEnquiryNoteHandler(enquiryId: string, noteId: string): Promise<Result<void, AppError>> {
  return getEnquiryService().deleteNote(enquiryId, noteId);
}
