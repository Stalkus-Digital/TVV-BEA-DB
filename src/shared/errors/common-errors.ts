import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ code: ErrorCode.VALIDATION_ERROR, message, statusCode: 400, details });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ code: ErrorCode.NOT_FOUND, message, statusCode: 404, details });
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super({ code: ErrorCode.UNAUTHORIZED, message, statusCode: 401, details });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super({ code: ErrorCode.FORBIDDEN, message, statusCode: 403, details });
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ code: ErrorCode.CONFLICT, message, statusCode: 409, details });
    this.name = "ConflictError";
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error", details?: unknown) {
    super({ code: ErrorCode.INTERNAL_ERROR, message, statusCode: 500, isOperational: false, details });
    this.name = "InternalError";
  }
}

export class NotImplementedError extends AppError {
  constructor(message = "Not implemented", details?: unknown) {
    super({ code: ErrorCode.NOT_IMPLEMENTED, message, statusCode: 501, details });
    this.name = "NotImplementedError";
  }
}

/** An expected, operational failure — a call took longer than its configured timeout. Not `InternalError`: this is routine, anticipated behavior for an external dependency, not an unexpected crash. */
export class TimeoutError extends AppError {
  constructor(message = "Operation timed out", details?: unknown) {
    super({ code: ErrorCode.TIMEOUT, message, statusCode: 504, details });
    this.name = "TimeoutError";
  }
}

/** The dependency this request would reach is currently circuit-broken (or otherwise known-unavailable) — rejected before attempting the call, not after it failed. */
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable", details?: unknown) {
    super({ code: ErrorCode.SERVICE_UNAVAILABLE, message, statusCode: 503, details });
    this.name = "ServiceUnavailableError";
  }
}
