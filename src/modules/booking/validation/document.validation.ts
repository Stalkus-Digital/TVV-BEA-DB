import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { DocumentKind } from "../types/document";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface AddDocumentInput {
  travellerId: string | null;
  kind: DocumentKind;
  fileUrl: string | null;
  fileName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
}

export function validateAddDocument(input: unknown): Result<AddDocumentInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (typeof body.kind !== "string" || !Object.values(DocumentKind).includes(body.kind as DocumentKind)) {
    return err(new ValidationError(`kind must be one of: ${Object.values(DocumentKind).join(", ")}`));
  }
  if (body.travellerId !== undefined && body.travellerId !== null && !isNonEmptyString(body.travellerId)) {
    return err(new ValidationError("travellerId must be a string"));
  }
  for (const field of ["fileUrl", "fileName", "notes"] as const) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
      return err(new ValidationError(`${field} must be a string`));
    }
  }
  for (const field of ["issuedAt", "expiresAt"] as const) {
    if (body[field] !== undefined && body[field] !== null) {
      if (typeof body[field] !== "string" || Number.isNaN(new Date(body[field] as string).getTime())) {
        return err(new ValidationError(`${field} must be a valid ISO date string`));
      }
    }
  }

  return ok({
    travellerId: (body.travellerId as string | undefined) ?? null,
    kind: body.kind as DocumentKind,
    fileUrl: (body.fileUrl as string | undefined) ?? null,
    fileName: (body.fileName as string | undefined) ?? null,
    issuedAt: (body.issuedAt as string | undefined) ?? null,
    expiresAt: (body.expiresAt as string | undefined) ?? null,
    notes: (body.notes as string | undefined) ?? null,
  });
}
