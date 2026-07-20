import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import type { PublicUser } from "@/modules/auth";
import { getAdminCustomerService } from "../module";
import type { AdminCustomerDetail, CustomerPaymentRecord } from "../services/admin-customer.service";
import type { CustomerNote } from "../types/customer-note";
import type { ListAdminCustomersQuery } from "../validation/admin-customer.validation";

export async function listAdminCustomersHandler(
  query: ListAdminCustomersQuery
): Promise<Result<PaginatedResult<PublicUser>, AppError>> {
  return getAdminCustomerService().list(query);
}

export async function getAdminCustomerHandler(id: string): Promise<Result<AdminCustomerDetail, AppError>> {
  return getAdminCustomerService().getById(id);
}

export async function createAdminCustomerHandler(
  body: unknown,
  context: AuthContext | null
): Promise<Result<AdminCustomerDetail, AppError>> {
  return getAdminCustomerService().create(body, context?.userId ?? null);
}

export async function updateAdminCustomerHandler(
  id: string,
  body: unknown,
  context: AuthContext | null
): Promise<Result<AdminCustomerDetail, AppError>> {
  return getAdminCustomerService().update(id, body, context?.userId ?? null);
}

export async function archiveAdminCustomerHandler(
  id: string,
  context: AuthContext | null
): Promise<Result<AdminCustomerDetail, AppError>> {
  return getAdminCustomerService().archive(id, context?.userId ?? null);
}

export async function restoreAdminCustomerHandler(
  id: string,
  context: AuthContext | null
): Promise<Result<AdminCustomerDetail, AppError>> {
  return getAdminCustomerService().restore(id, context?.userId ?? null);
}

export async function bulkArchiveAdminCustomersHandler(
  body: unknown,
  context: AuthContext | null
): Promise<Result<{ updated: number }, AppError>> {
  return getAdminCustomerService().bulkArchive(body, context?.userId ?? null);
}

export async function listAdminCustomerNotesHandler(userId: string): Promise<Result<CustomerNote[], AppError>> {
  return getAdminCustomerService().listNotes(userId);
}

export async function addAdminCustomerNoteHandler(
  userId: string,
  body: unknown,
  context: AuthContext | null
): Promise<Result<CustomerNote, AppError>> {
  return getAdminCustomerService().addNote(userId, body, context?.userId ?? null);
}

export async function deleteAdminCustomerNoteHandler(userId: string, noteId: string): Promise<Result<void, AppError>> {
  return getAdminCustomerService().deleteNote(userId, noteId);
}

export async function listAdminCustomerPaymentsHandler(userId: string): Promise<Result<CustomerPaymentRecord[], AppError>> {
  return getAdminCustomerService().listPayments(userId);
}
