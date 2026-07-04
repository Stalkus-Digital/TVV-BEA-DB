import type { LegacyPackageDTO } from "./legacy-package.dto";

/**
 * Mirrors `lib/services/search.service.ts`'s `SearchResults` shape exactly.
 * Travel OS's search (`WebsiteSearchResultDTO`) only ever searches
 * packages — `destinations`/`guides` are always returned empty here, not
 * fabricated, since Travel OS has no destination-search or guides content
 * type at all (see docs/26).
 */
export interface LegacySearchResultDTO {
  query: string;
  packages: LegacyPackageDTO[];
  destinations: never[];
  guides: never[];
  totalCount: number;
}
