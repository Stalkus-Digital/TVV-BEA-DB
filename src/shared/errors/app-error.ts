import type { ErrorCode } from "./error-codes";

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode: number;
  isOperational?: boolean;
  details?: unknown;
}

/**
 * Base class for every error the backend foundation and future modules throw.
 * Kept deliberately small — subclass per concern (see common-errors.ts) rather
 * than adding optional fields here.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
