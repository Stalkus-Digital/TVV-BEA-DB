import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CreateBookingInput {
  quoteId: string;
  internalNotes: string | null;
}

export function validateCreateBooking(input: unknown): Result<CreateBookingInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.quoteId)) return err(new ValidationError("quoteId is required"));
  if (body.internalNotes !== undefined && body.internalNotes !== null && typeof body.internalNotes !== "string") {
    return err(new ValidationError("internalNotes must be a string"));
  }

  return ok({
    quoteId: body.quoteId,
    internalNotes: (body.internalNotes as string | undefined) ?? null,
  });
}

export interface UpdateBookingInput {
  internalNotes?: string | null;
}

export function validateUpdateBooking(input: unknown): Result<UpdateBookingInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateBookingInput = {};

  if (body.internalNotes !== undefined) {
    if (body.internalNotes !== null && typeof body.internalNotes !== "string") {
      return err(new ValidationError("internalNotes must be a string or null"));
    }
    output.internalNotes = body.internalNotes as string | null;
  }

  return ok(output);
}

export interface CancelBookingInput {
  reason: string;
}

export function validateCancelBooking(input: unknown): Result<CancelBookingInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { reason } = input as Record<string, unknown>;
  if (!isNonEmptyString(reason)) return err(new ValidationError("reason is required"));
  return ok({ reason });
}
