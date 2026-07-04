import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface AddNoteInput {
  body: string;
}

export function validateAddNote(input: unknown): Result<AddNoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { body } = input as Record<string, unknown>;
  if (!isNonEmptyString(body)) return err(new ValidationError("body is required"));
  return ok({ body });
}
