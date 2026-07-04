/**
 * Universal envelope every service returns. Consumers branch on `ok`:
 *
 *   const res = await packagesService.getBySlug(slug);
 *   if (!res.ok) { ...handle res.error... }
 *   const pkg = res.data;
 *
 * The envelope is uniform whether the underlying source is real HTTP,
 * mock data, or a hybrid cache.
 */

import type { ApiError } from "./errors";

export interface ResultMeta {
  source: "live" | "mock" | "cache";
  fetchedAt: string;
  takenMs?: number;
  vendor?: string;
}

export type ServiceResult<T> =
  | { ok: true; data: T; meta: ResultMeta }
  | { ok: false; error: ApiError; meta: ResultMeta };

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type Paginated<T> = ServiceResult<Page<T>>;

export function makeMeta(source: ResultMeta["source"] = "mock", vendor?: string): ResultMeta {
  return { source, fetchedAt: new Date().toISOString(), vendor };
}

export function ok<T>(data: T, source: ResultMeta["source"] = "mock", vendor?: string): ServiceResult<T> {
  return { ok: true, data, meta: makeMeta(source, vendor) };
}

export function fail<T>(error: import("./errors").ApiError, source: ResultMeta["source"] = "mock"): ServiceResult<T> {
  return { ok: false, error, meta: makeMeta(source) };
}
