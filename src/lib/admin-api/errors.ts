export type ApiErrorCode =
  | "network"
  | "timeout"
  | "not_found"
  | "unauthorised"
  | "forbidden"
  | "validation"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, options: { status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = options.status;
  }

  static fromUnknown(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof Error && err.name === "AbortError") {
      return new ApiError("timeout", "Request timed out");
    }
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      return new ApiError("network", "Network error reaching API");
    }
    return new ApiError("unknown", (err as Error)?.message ?? "Unknown error");
  }
}

export function fromStatus(status: number, body?: unknown): ApiError {
  let extractedMessage: string | undefined;

  if (body && typeof body === "object" && "error" in body) {
    const errorData = (body as { error: unknown }).error;
    if (typeof errorData === "string") {
      extractedMessage = errorData;
    } else if (typeof errorData === "object" && errorData !== null && "message" in errorData && typeof (errorData as { message: unknown }).message === "string") {
      extractedMessage = (errorData as { message: string }).message;
    }
  }

  const message =
    extractedMessage
      ? extractedMessage
      : status === 401
        ? "Authentication required"
        : status === 403
          ? "Forbidden"
          : status >= 500
            ? "Server error"
            : "Request failed";

  if (status === 404) return new ApiError("not_found", message, { status });
  if (status === 401) return new ApiError("unauthorised", message, { status });
  if (status === 403) return new ApiError("forbidden", message, { status });
  if (status === 422 || status === 400) return new ApiError("validation", message, { status });
  if (status >= 500) return new ApiError("server", message, { status });
  return new ApiError("unknown", message, { status });
}
