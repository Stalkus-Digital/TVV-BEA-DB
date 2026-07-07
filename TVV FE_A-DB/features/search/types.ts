import type { SearchResults } from "@/lib/services/search.service";

export type SearchSort = "relevant" | "price-asc" | "price-desc" | "title";
export type SearchTypeFilter = "all" | "packages" | "destinations" | "guides";

export interface SearchFilters {
  sort: SearchSort;
  type: SearchTypeFilter;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  sort: "relevant",
  type: "all",
};

export type { SearchResults };
