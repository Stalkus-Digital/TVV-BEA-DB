import { AppError, InternalError, ValidationError } from "@/shared/errors";

export interface TripJackRawError {
  code?: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
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
    const message = this.extractMessage(rawError);
    if (rawError.statusCode === 400) {
      return new ValidationError(message ?? "TripJack rejected the request", {
        source: "tripjack",
        ...rawError,
      });
    }
    return new InternalError(message ?? "Unexpected TripJack error", { source: "tripjack", ...rawError });
  }

  private extractMessage(rawError: TripJackRawError): string | undefined {
    if (rawError.message?.trim()) return rawError.message.trim();

    const details = rawError.details;
    if (typeof details === "string" && details.trim()) return details.trim();

    if (details && typeof details === "object") {
      const record = details as Record<string, unknown>;

      const nestedMessage = this.readString(record.message);
      if (nestedMessage) return nestedMessage;

      const nestedError = record.error;
      if (nestedError && typeof nestedError === "object") {
        const errorRecord = nestedError as Record<string, unknown>;
        const errorMessage = this.readString(errorRecord.message);
        if (errorMessage) return errorMessage;
      }

      const errors = record.errors;
      if (Array.isArray(errors)) {
        for (const item of errors) {
          if (item && typeof item === "object") {
            const errorMessage = this.readString((item as Record<string, unknown>).message);
            if (errorMessage) return errorMessage;
          }
        }
      }

      const status = record.status;
      if (status && typeof status === "object") {
        const statusRecord = status as Record<string, unknown>;
        const statusMessage = this.readString(statusRecord.message);
        if (statusMessage) return statusMessage;
      }
    }

    return undefined;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }
}
