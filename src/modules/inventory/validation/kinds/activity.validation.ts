import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

import type { ActivityDetails } from "../../types/kinds";

export function validateActivityDetails(input: unknown): Result<ActivityDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Activity details must be an object"));
  }
  const { durationMinutes, category, duration, location, adultPrice, childPrice, ...rest } = input as Record<string, unknown>;

  if (durationMinutes !== undefined && (typeof durationMinutes !== "number" || durationMinutes <= 0)) {
    return err(new ValidationError("durationMinutes must be a positive number"));
  }
  if (category !== undefined && typeof category !== "string") {
    return err(new ValidationError("category must be a string"));
  }
  const parsedCategory = category ? (category as string).trim() : "";

  return ok({ 
    ...(durationMinutes !== undefined ? { durationMinutes: durationMinutes as number } : {}),
    category: parsedCategory,
    ...(duration !== undefined ? { duration: String(duration) } : {}),
    ...(location !== undefined ? { location: String(location) } : {}),
    ...(adultPrice !== undefined ? { adultPrice: typeof adultPrice === "string" ? Number(adultPrice) : (adultPrice as number) } : {}),
    ...(childPrice !== undefined ? { childPrice: typeof childPrice === "string" ? Number(childPrice) : (childPrice as number) } : {}),
    ...((input as Record<string, unknown>).starterPrice !== undefined ? { starterPrice: typeof (input as Record<string, unknown>).starterPrice === "string" ? Number((input as Record<string, unknown>).starterPrice) : ((input as Record<string, unknown>).starterPrice as number) } : {}),
    ...((input as Record<string, unknown>).offerPrice !== undefined ? { offerPrice: typeof (input as Record<string, unknown>).offerPrice === "string" ? Number((input as Record<string, unknown>).offerPrice) : ((input as Record<string, unknown>).offerPrice as number) } : {}),
    ...rest,
  });
}
