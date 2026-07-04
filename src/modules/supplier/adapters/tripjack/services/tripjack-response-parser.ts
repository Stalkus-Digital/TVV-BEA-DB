import { ValidationError } from "@/shared/errors";
import { err, ok, type Result } from "@/shared/types";

/**
 * Pure data transformation, not an API call — real and working today.
 * Validates/narrows a raw (untyped) response body into the expected DTO
 * shape before it reaches a mapper. No real response has ever been received
 * yet; this exists so the pattern is proven, ready for when one is.
 */
export class TripJackResponseParser {
  parse<T>(raw: unknown, requiredKeys: (keyof T)[]): Result<T, ValidationError> {
    if (typeof raw !== "object" || raw === null) {
      return err(new ValidationError("TripJack response must be an object"));
    }
    const missing = requiredKeys.filter((key) => !(key in (raw as Record<string, unknown>)));
    if (missing.length > 0) {
      return err(new ValidationError(`TripJack response missing required fields: ${missing.join(", ")}`));
    }
    return ok(raw as T);
  }
}
