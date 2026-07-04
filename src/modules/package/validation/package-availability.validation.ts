import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export interface CreateAvailabilityInput {
  validFrom: string;
  validTo: string;
  blackoutDates: string[];
  maxBookingsPerDay: number | null;
}

export function validateCreateAvailability(input: unknown): Result<CreateAvailabilityInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { validFrom, validTo, blackoutDates, maxBookingsPerDay } = input as Record<string, unknown>;

  if (typeof validFrom !== "string" || Number.isNaN(Date.parse(validFrom))) {
    return err(new ValidationError("validFrom must be a valid date string"));
  }
  if (typeof validTo !== "string" || Number.isNaN(Date.parse(validTo))) {
    return err(new ValidationError("validTo must be a valid date string"));
  }
  if (new Date(validTo).getTime() <= new Date(validFrom).getTime()) {
    return err(new ValidationError("validTo must be after validFrom"));
  }
  if (blackoutDates !== undefined) {
    if (!Array.isArray(blackoutDates) || !blackoutDates.every((d) => typeof d === "string" && !Number.isNaN(Date.parse(d)))) {
      return err(new ValidationError("blackoutDates must be an array of valid date strings"));
    }
  }
  if (maxBookingsPerDay !== undefined && maxBookingsPerDay !== null) {
    if (typeof maxBookingsPerDay !== "number" || maxBookingsPerDay <= 0) {
      return err(new ValidationError("maxBookingsPerDay must be a positive number"));
    }
  }

  return ok({
    validFrom,
    validTo,
    blackoutDates: (blackoutDates as string[] | undefined) ?? [],
    maxBookingsPerDay: (maxBookingsPerDay as number | null | undefined) ?? null,
  });
}
