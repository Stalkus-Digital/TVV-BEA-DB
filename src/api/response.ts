import { AppError } from "@/shared/errors";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

/** The one response envelope every future module's API layer must return. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function apiError(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    };
  }
  // Non-AppError (unexpected) errors never leak their raw message/stack to the response body.
  return {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Unexpected error" },
  };
}

export function statusForError(error: unknown): number {
  if (error instanceof AppError) return error.statusCode;
  return 500;
}
