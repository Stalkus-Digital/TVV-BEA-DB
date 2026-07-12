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

    const rawObj = raw as any;
    if (rawObj.status && rawObj.status.success === false) {
      const msg = rawObj.status.error?.message || rawObj.errors?.[0]?.message || "TripJack API returned an error";
      return err(new ValidationError(`TripJack API Error: ${msg}`));
    }
    
    // Some endpoints wrap status directly, others might have it at root.
    // If it's a known error shape, we already caught it above.
    
    const missing = requiredKeys.filter((key) => !(key in (raw as Record<string, unknown>)));
    if (missing.length > 0) {
      return err(new ValidationError(`TripJack response missing required fields: ${missing.join(", ")}`));
    }
    return ok(raw as T);
  }
}
