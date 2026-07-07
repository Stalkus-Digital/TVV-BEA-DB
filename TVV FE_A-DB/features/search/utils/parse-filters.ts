import type { SearchFilters, SearchSort, SearchTypeFilter } from "../types";
import { DEFAULT_SEARCH_FILTERS } from "../types";

const SORT_VALUES: SearchSort[] = ["relevant", "price-asc", "price-desc", "title"];
const TYPE_VALUES: SearchTypeFilter[] = ["all", "packages", "destinations", "guides"];

function isSort(value: string | null | undefined): value is SearchSort {
  return !!value && SORT_VALUES.includes(value as SearchSort);
}

function isType(value: string | null | undefined): value is SearchTypeFilter {
  return !!value && TYPE_VALUES.includes(value as SearchTypeFilter);
}

export function parseSearchFilters(params: {
  sort?: string;
  type?: string;
}): SearchFilters {
  return {
    sort: isSort(params.sort) ? params.sort : DEFAULT_SEARCH_FILTERS.sort,
    type: isType(params.type) ? params.type : DEFAULT_SEARCH_FILTERS.type,
  };
}
