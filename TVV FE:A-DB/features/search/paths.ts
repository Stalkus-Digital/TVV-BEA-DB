import type { SearchFilters } from "./types";

export const SEARCH_ROUTE = "/search";

export function searchPath(q?: string, filters?: Partial<SearchFilters>): string {
  const params = new URLSearchParams();
  const trimmed = q?.trim();
  if (trimmed) params.set("q", trimmed);
  if (filters?.sort && filters.sort !== "relevant") params.set("sort", filters.sort);
  if (filters?.type && filters.type !== "all") params.set("type", filters.type);
  const qs = params.toString();
  return qs ? `${SEARCH_ROUTE}?${qs}` : SEARCH_ROUTE;
}
