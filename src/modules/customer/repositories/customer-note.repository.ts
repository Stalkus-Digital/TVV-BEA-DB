import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { CustomerNote } from "../types/customer-note";

export interface CustomerNoteRepository {
  listByUserId(userId: string): Promise<Result<CustomerNote[], AppError>>;
  findById(noteId: string): Promise<Result<CustomerNote | null, AppError>>;
  add(data: Omit<CustomerNote, "id">): Promise<Result<CustomerNote, AppError>>;
  update(noteId: string, body: string): Promise<Result<CustomerNote, AppError>>;
  delete(noteId: string): Promise<Result<void, AppError>>;
}
