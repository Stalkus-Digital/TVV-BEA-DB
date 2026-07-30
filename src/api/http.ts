import { NextResponse } from "next/server";
import { apiError, apiSuccess, statusForError, type ApiResponse } from "./response";

export interface JsonSuccessOptions {
  status?: number;
  meta?: Record<string, unknown>;
}

export interface JsonErrorOptions {
  status?: number;
}

export function jsonSuccess<T>(data: T, options?: JsonSuccessOptions): NextResponse<ApiResponse<T>> {
  return NextResponse.json(apiSuccess(data, options?.meta), { status: options?.status ?? 200 });
}

export function jsonError(error: unknown, options?: JsonErrorOptions): NextResponse<ApiResponse<never>> {
  return NextResponse.json(apiError(error), { status: options?.status ?? statusForError(error) });
}
