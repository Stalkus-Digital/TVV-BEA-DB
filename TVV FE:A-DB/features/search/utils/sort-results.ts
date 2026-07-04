import type { SearchResults } from "@/lib/services/search.service";
import type { Package } from "@/lib/models";
import type { SearchFilters } from "../types";

function sortPackages(packages: Package[], sort: SearchFilters["sort"]): Package[] {
  const copy = [...packages];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.pricing.perAdult - b.pricing.perAdult);
    case "price-desc":
      return copy.sort((a, b) => b.pricing.perAdult - a.pricing.perAdult);
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
}

export function applySearchFilters(results: SearchResults, filters: SearchFilters): SearchResults {
  const packages =
    filters.type === "all" || filters.type === "packages"
      ? sortPackages(results.packages, filters.sort)
      : [];
  const destinations =
    filters.type === "all" || filters.type === "destinations" ? results.destinations : [];
  const guides = filters.type === "all" || filters.type === "guides" ? results.guides : [];

  return {
    ...results,
    packages,
    destinations,
    guides,
    totalCount: packages.length + destinations.length + guides.length,
  };
}
