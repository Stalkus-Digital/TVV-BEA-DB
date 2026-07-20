import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import {
  DocumentKind,
  DocumentVerificationStatus,
  type DocumentVerificationStatus as VerificationStatus,
} from "../types/document";

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
  verificationStatus: VerificationStatus;
}

export interface UpdateDocumentInput {
  travellerId?: string | null;
  kind?: DocumentKind;
  fileUrl?: string | null;
  fileName?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  verificationStatus?: VerificationStatus;
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
  if (
    body.verificationStatus !== undefined &&
    body.verificationStatus !== null &&
    !Object.values(DocumentVerificationStatus).includes(body.verificationStatus as VerificationStatus)
  ) {
    return err(
      new ValidationError(`verificationStatus must be one of: ${Object.values(DocumentVerificationStatus).join(", ")}`)
    );
  }

  return ok({
    travellerId: (body.travellerId as string | undefined) ?? null,
    kind: body.kind as DocumentKind,
    fileUrl: (body.fileUrl as string | undefined) ?? null,
    fileName: (body.fileName as string | undefined) ?? null,
    issuedAt: (body.issuedAt as string | undefined) ?? null,
    expiresAt: (body.expiresAt as string | undefined) ?? null,
    notes: (body.notes as string | undefined) ?? null,
    verificationStatus:
      (body.verificationStatus as VerificationStatus | undefined) ?? DocumentVerificationStatus.PENDING,
  });
}

export function validateUpdateDocument(input: unknown): Result<UpdateDocumentInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const patch: UpdateDocumentInput = {};

  if (body.kind !== undefined) {
    if (!Object.values(DocumentKind).includes(body.kind as DocumentKind)) {
      return err(new ValidationError(`kind must be one of: ${Object.values(DocumentKind).join(", ")}`));
    }
    patch.kind = body.kind as DocumentKind;
  }
  if (body.travellerId !== undefined) {
    if (body.travellerId !== null && !isNonEmptyString(body.travellerId)) {
      return err(new ValidationError("travellerId must be a string"));
    }
    patch.travellerId = body.travellerId as string | null;
  }
  for (const field of ["fileUrl", "fileName", "notes"] as const) {
    if (body[field] !== undefined) {
      if (body[field] !== null && typeof body[field] !== "string") {
        return err(new ValidationError(`${field} must be a string`));
      }
      patch[field] = body[field] as string | null;
    }
  }
  for (const field of ["issuedAt", "expiresAt"] as const) {
    if (body[field] !== undefined) {
      if (
        body[field] !== null &&
        (typeof body[field] !== "string" || Number.isNaN(new Date(body[field] as string).getTime()))
      ) {
        return err(new ValidationError(`${field} must be a valid ISO date string`));
      }
      patch[field] = body[field] as string | null;
    }
  }
  if (body.verificationStatus !== undefined) {
    if (!Object.values(DocumentVerificationStatus).includes(body.verificationStatus as VerificationStatus)) {
      return err(
        new ValidationError(`verificationStatus must be one of: ${Object.values(DocumentVerificationStatus).join(", ")}`)
      );
    }
    patch.verificationStatus = body.verificationStatus as VerificationStatus;
  }

  if (Object.keys(patch).length === 0) {
    return err(new ValidationError("At least one document field is required"));
  }
  return ok(patch);
}
