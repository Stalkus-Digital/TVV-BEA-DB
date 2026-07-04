import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPassengerDocumentService } from "../module";
import type { PassengerDocument } from "../types/document";

export async function listDocumentsHandler(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
  return getPassengerDocumentService().listByBooking(bookingId);
}

export async function addDocumentHandler(bookingId: string, body: unknown): Promise<Result<PassengerDocument, AppError>> {
  return getPassengerDocumentService().add(bookingId, body);
}
