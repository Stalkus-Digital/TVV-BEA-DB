import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import { getPassengerDocumentService } from "../module";
import type { PassengerDocument } from "../types/document";

export async function listDocumentsHandler(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
  return getPassengerDocumentService().listByBooking(bookingId);
}

export async function addDocumentHandler(
  bookingId: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<PassengerDocument, AppError>> {
  return getPassengerDocumentService().add(bookingId, body, context?.userId ?? null);
}

export async function updateDocumentHandler(
  bookingId: string,
  documentId: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<PassengerDocument, AppError>> {
  return getPassengerDocumentService().update(bookingId, documentId, body, context?.userId ?? null);
}

export async function removeDocumentHandler(
  bookingId: string,
  documentId: string,
  context: AuthContext | null = null
): Promise<Result<void, AppError>> {
  return getPassengerDocumentService().remove(bookingId, documentId, context?.userId ?? null);
}
