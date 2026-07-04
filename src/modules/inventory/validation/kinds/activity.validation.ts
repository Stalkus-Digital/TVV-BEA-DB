import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { ActivityDetails } from "../../types/kinds";

export function validateActivityDetails(input: unknown): Result<ActivityDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Activity details must be an object"));
  }
  const { durationMinutes, category } = input as Record<string, unknown>;

  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return err(new ValidationError("durationMinutes must be a positive number"));
  }
  if (typeof category !== "string" || category.trim().length === 0) {
    return err(new ValidationError("category is required"));
  }

  return ok({ durationMinutes, category });
}
