/**
 * Travel OS response envelope helpers.
 *
 * Success: `{ success: true, data: T, meta?: M }`
 * Error:   `{ success: false, error: { code, message } }`
 */

import { fromStatus } from "./errors";

export interface PaginatedPayload<T> {
  meta: {
    total: number;
    page: number;
    limit?: number;
    pageSize?: number;
    totalPages?: number;
  };
  data?: T[];
  items?: T[];
}

function readErrorMessage(rec: Record<string, unknown>): string {
  const nested = rec.error;
  if (nested && typeof nested === "object") {
    const msg = (nested as Record<string, unknown>).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return "Request failed";
}

/** Strip the success envelope; throw on `success: false`. */
export function unwrapApiData(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const rec = body as Record<string, unknown>;

  if (rec.success === false) {
    throw fromStatus(400, { message: readErrorMessage(rec), ...rec });
  }

  if (rec.success === true && "data" in rec) {
    return rec.data;
  }

  return body;
}

/** Rows from a plain array, `{ data: rows }`, `{ items: rows }`, or paginated envelope. */
export function paginatedRows<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.items)) return rec.items as T[];
    if (Array.isArray(rec.data)) return rec.data as T[];
    if ("data" in rec && rec.data && typeof rec.data === "object") {
      const inner = rec.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.data)) return inner.data as T[];
    }
  }

  return [];
}

/** Read a named field from a detail payload, e.g. `{ package, seo }`. */
export function pickField<T>(data: unknown, key: string): T | null {
  if (!data || typeof data !== "object" || !(key in data)) return null;
  return (data as Record<string, T>)[key] ?? null;
}
