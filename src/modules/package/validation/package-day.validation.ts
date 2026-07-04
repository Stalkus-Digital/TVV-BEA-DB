import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export interface CreateDayInput {
  dayNumber: number;
  title: string;
  description: string | null;
  destinationId: string | null;
}

export function validateCreateDay(input: unknown): Result<CreateDayInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { dayNumber, title, description, destinationId } = input as Record<string, unknown>;

  if (typeof dayNumber !== "number" || dayNumber <= 0) {
    return err(new ValidationError("dayNumber must be a positive number"));
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return err(new ValidationError("title is required"));
  }
  if (description !== undefined && description !== null && typeof description !== "string") {
    return err(new ValidationError("description must be a string or null"));
  }
  if (destinationId !== undefined && destinationId !== null && typeof destinationId !== "string") {
    return err(new ValidationError("destinationId must be a string or null"));
  }

  return ok({
    dayNumber,
    title,
    description: (description as string | null | undefined) ?? null,
    destinationId: (destinationId as string | null | undefined) ?? null,
  });
}

export interface UpdateDayInput {
  title?: string;
  description?: string | null;
}

export function validateUpdateDay(input: unknown): Result<UpdateDayInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { title, description } = input as Record<string, unknown>;
  const output: UpdateDayInput = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) return err(new ValidationError("title must be a non-empty string"));
    output.title = title;
  }
  if (description !== undefined) {
    if (description !== null && typeof description !== "string") return err(new ValidationError("description must be a string or null"));
    output.description = description as string | null;
  }

  return ok(output);
}
