export { SearchBar } from "./components/SearchBar";
export { LiveSearchPanel } from "./components/LiveSearchPanel";
export { SearchFiltersBar } from "./components/SearchFilters";
export {
  SearchResultGroups,
  SearchEmptyState,
  SearchErrorState,
  SearchPrompt,
} from "./components/SearchResultGroups";
export { SearchResultsPage } from "./components/SearchResultsPage";

export { searchFeatureService } from "./services/search.feature.service";
export { useSearchQuery } from "./hooks/useSearchQuery";
export { useRecentSearches } from "./hooks/useRecentSearches";
export { useDebouncedValue } from "./hooks/useDebouncedValue";

export { searchPath, SEARCH_ROUTE } from "./paths";
export { applySearchFilters } from "./utils/sort-results";
export { parseSearchFilters } from "./utils/parse-filters";
export {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "./utils/recent-searches";

export type { SearchFilters, SearchSort, SearchTypeFilter, SearchResults } from "./types";
export { DEFAULT_SEARCH_FILTERS } from "./types";
