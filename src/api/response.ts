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

function isAppError(error: unknown): error is AppError {
  return typeof error === "object" && error !== null && "code" in error && "statusCode" in error;
}

export function apiError(error: unknown): ApiErrorResponse {
  if (isAppError(error)) {
    return {
      success: false,
      error: { code: error.code as string, message: error.message as string, details: error.details },
    };
  }
  // Non-AppError (unexpected) errors never leak their raw message/stack to the response body.
  return {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Unexpected error" },
  };
}

export function statusForError(error: unknown): number {
  if (isAppError(error)) return error.statusCode as number;
  return 500;
}
