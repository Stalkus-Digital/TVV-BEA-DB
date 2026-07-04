import type { AppError } from "@/shared/errors";
import { isErr, ok, type Result } from "@/shared/types";
import { fetchSearchResults } from "../adapters/website-search.adapter";
import { toLegacySearchResult } from "../transformers/search.transformer";
import type { LegacySearchResultDTO } from "../dto/legacy-search.dto";

export interface LegacySearchQuery {
  keyword?: string;
  destinationSlug?: string;
  minDurationDays?: number;
  maxDurationDays?: number;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  packageType?: string;
  page?: number;
  pageSize?: number;
}

/** Reshapes Website search results (packages only) into the frontend's `SearchResults` shape. */
export async function searchLegacy(query: LegacySearchQuery): Promise<Result<LegacySearchResultDTO, AppError>> {
  const result = await fetchSearchResults(query);
  if (isErr(result)) return result;
  return ok(toLegacySearchResult(result.value, query.keyword ?? ""));
}
