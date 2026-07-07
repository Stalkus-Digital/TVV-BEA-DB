import type { Destination, Guide, Package } from "@/lib/models";
import { apiClient } from "./client";
import { endpoints } from "./config";
import { toPackage, type WebsitePackageSummaryDTO } from "./packages";

export interface UniversalSearchParams {
  q: string;
  limit?: number;
  types?: ("packages" | "destinations" | "guides")[];
}

export interface UniversalSearchResults {
  query: string;
  packages: Package[];
  destinations: Destination[];
  guides: Guide[];
  totalCount: number;
}

function emptyResults(query: string): UniversalSearchResults {
  return { query, packages: [], destinations: [], guides: [], totalCount: 0 };
}

/** Travel OS `/api/website/search` — packages only. */
interface WebsiteSearchResultDTO {
  results: WebsitePackageSummaryDTO[];
  total: number;
}

/**
 * `destinations`/`guides` are always empty — Travel OS search only covers
 * packages. See backend docs/29_API_MAPPING.md.
 */
export async function fetchUniversalSearch(params: UniversalSearchParams): Promise<UniversalSearchResults> {
  const trimmed = params.q.trim();
  if (!trimmed) return emptyResults(trimmed);

  const qs = new URLSearchParams({ keyword: trimmed });
  if (params.limit) qs.set("pageSize", String(params.limit));

  const body = await apiClient.get<WebsiteSearchResultDTO>(`${endpoints.search.universal}?${qs.toString()}`, {
    noAuth: true,
  });
  if (!body) return emptyResults(trimmed);

  const packagesOnly = !params.types?.length || params.types.includes("packages");

  return {
    query: trimmed,
    packages: packagesOnly ? body.results.map(toPackage) : [],
    destinations: [],
    guides: [],
    totalCount: packagesOnly ? body.total : 0,
  };
}
