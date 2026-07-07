import type { PaginatedResult, PaginationParams, Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Enquiry, EnquiryNote } from "../types/enquiry";

export interface EnquiryListFilter extends PaginationParams {
  status?: string;
  type?: string;
  assignedToUserId?: string;
}

export interface EnquiryRepository extends BaseRepository<Enquiry, string> {
  findByFilter(filter: EnquiryListFilter): Promise<Result<PaginatedResult<Enquiry>, AppError>>;
  listNotes(enquiryId: string): Promise<Result<EnquiryNote[], AppError>>;
  findNoteById(noteId: string): Promise<Result<EnquiryNote | null, AppError>>;
  addNote(data: Omit<EnquiryNote, "id">): Promise<Result<EnquiryNote, AppError>>;
  updateNote(noteId: string, body: string): Promise<Result<EnquiryNote, AppError>>;
  deleteNote(noteId: string): Promise<Result<void, AppError>>;
}
