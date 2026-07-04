import { AppError, InternalError, ValidationError } from "@/shared/errors";

export interface TripJackRawError {
  code?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Pure data transformation, not an API call — real and working today,
 * unlike the client/auth methods. Normalizes whatever shape TripJack's real
 * API eventually returns into this codebase's own AppError taxonomy, so a
 * TripJack-specific error code never surfaces past this adapter (error
 * normalization principle carried over from SUPPLIER_ABSTRACTION_LAYER.md).
 */
export class TripJackErrorHandler {
  toAppError(rawError: TripJackRawError): AppError {
    if (rawError.statusCode === 400) {
      return new ValidationError(rawError.message ?? "TripJack rejected the request", {
        source: "tripjack",
        ...rawError,
      });
    }
    return new InternalError(rawError.message ?? "Unexpected TripJack error", { source: "tripjack", ...rawError });
  }
}
