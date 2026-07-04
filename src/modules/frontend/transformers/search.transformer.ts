import type { WebsiteSearchResultDTO } from "@/modules/website";
import type { LegacySearchResultDTO } from "../dto/legacy-search.dto";
import { toLegacyPackageFromSummary } from "./package.transformer";

/** `WebsiteSearchResultDTO` → `LegacySearchResultDTO` — `destinations`/`guides` are always empty; see docs/30. */
export function toLegacySearchResult(dto: WebsiteSearchResultDTO, query: string): LegacySearchResultDTO {
  return {
    query,
    packages: dto.results.map(toLegacyPackageFromSummary),
    destinations: [],
    guides: [],
    totalCount: dto.total,
  };
}
