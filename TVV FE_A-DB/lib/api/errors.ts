/**
 * Typed error classes. Services should throw / return these so consumers can
 * branch on category instead of parsing strings.
 */

export type ApiErrorCode =
  | "network"
  | "timeout"
  | "not_found"
  | "unauthorised"
  | "forbidden"
  | "validation"
  | "vendor_unavailable"
  | "rate_limited"
  | "server"
  | "unknown"
  /** Feature has no Travel OS backend module at all — never sent over the network, thrown client-side. */
  | "not_implemented";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;
  readonly retryable: boolean;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { status?: number; details?: unknown; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = options.status;
    this.details = options.details;
    this.retryable = options.retryable ?? ["timeout", "network", "vendor_unavailable", "server"].includes(code);
  }

  /** Used for features Travel OS has no backend module for — see docs/26_FRONTEND_BACKEND_MAPPING.md in the backend repo. */
  static notImplemented(feature: string): ApiError {
    return new ApiError("not_implemented", `${feature} is not available yet — no Travel OS backend module exists for it.`, {
      retryable: false,
    });
  }

  static fromUnknown(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof Error && err.name === "AbortError") {
      return new ApiError("timeout", "Request timed out", { retryable: true });
    }
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      return new ApiError("network", "Network error reaching API", { retryable: true });
    }
    return new ApiError("unknown", (err as Error)?.message ?? "Unknown error", {
      details: err,
    });
  }
}

export function fromStatus(status: number, body?: unknown): ApiError {
  if (status === 404) return new ApiError("not_found", "Resource not found", { status, details: body });
  if (status === 401) return new ApiError("unauthorised", "Authentication required", { status });
  if (status === 403) return new ApiError("forbidden", "Forbidden", { status });
  if (status === 422 || status === 400) return new ApiError("validation", "Invalid request", { status, details: body });
  if (status === 429) return new ApiError("rate_limited", "Too many requests", { status, retryable: true });
  if (status === 503) return new ApiError("vendor_unavailable", "Upstream vendor unavailable", { status, retryable: true });
  if (status >= 500) return new ApiError("server", "Server error", { status, retryable: true });
  return new ApiError("unknown", `Unexpected status ${status}`, { status });
}
