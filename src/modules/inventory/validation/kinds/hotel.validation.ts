import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { HotelDetails } from "../../types/kinds";

export function validateHotelDetails(input: unknown): Result<HotelDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Hotel details must be an object"));
  }
  const { starRating, address, latitude, longitude } = input as Record<string, unknown>;

  let parsedStarRating = typeof starRating === "string" ? Number(starRating) : starRating;
  if (parsedStarRating === undefined || parsedStarRating === null || parsedStarRating === 0 || Number.isNaN(parsedStarRating)) parsedStarRating = 3; // fallback to 3 stars

  if (typeof parsedStarRating !== "number" || parsedStarRating < 1 || parsedStarRating > 5) {
    return err(new ValidationError("starRating must be a number between 1 and 5"));
  }
  
  if (typeof address !== "string" || address.trim().length === 0) {
    return err(new ValidationError("address is required"));
  }
  if (latitude !== undefined && typeof latitude !== "number") {
    return err(new ValidationError("latitude must be a number"));
  }
  if (longitude !== undefined && typeof longitude !== "number") {
    return err(new ValidationError("longitude must be a number"));
  }

  return ok({
    starRating: parsedStarRating as number,
    address,
    ...(latitude !== undefined ? { latitude: latitude as number } : {}),
    ...(longitude !== undefined ? { longitude: longitude as number } : {}),
  });
}
