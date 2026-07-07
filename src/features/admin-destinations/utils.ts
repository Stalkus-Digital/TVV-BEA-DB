import type {
  City,
  Country,
  Destination,
  DestinationCategory,
  DestinationListFilters,
  DestinationListRow,
  Region,
  State,
} from "./types";

export function formatDestinationDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function resolveGeoName(id: string | null, map: Map<string, { name: string }>): string {
  if (!id) return "—";
  return map.get(id)?.name ?? "—";
}

export function resolveCategoryLabel(categoryIds: string[], categoriesById: Map<string, DestinationCategory>): string {
  if (categoryIds.length === 0) return "—";
  return categoryIds.map((id) => categoriesById.get(id)?.name ?? id).join(", ");
}

export function applyDestinationSearch(items: Destination[], search?: string): Destination[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.description?.toLowerCase().includes(query) ?? false)
  );
}

export function applyDestinationStatusFilter(items: Destination[], status?: DestinationListFilters["status"]): Destination[] {
  if (!status) return items;
  return items.filter((item) => item.status === status);
}

export function applyDestinationRegionFilter(items: Destination[], regionId?: string): Destination[] {
  if (!regionId) return items;
  return items.filter((item) => item.regionId === regionId);
}

export function enrichDestinationRows(
  destinations: Destination[],
  countriesById: Map<string, Country>,
  statesById: Map<string, State>,
  regionsById: Map<string, Region>,
  categoriesById: Map<string, DestinationCategory>
): DestinationListRow[] {
  return destinations.map((dest) => ({
    ...dest,
    countryName: resolveGeoName(dest.countryId, countriesById),
    stateName: resolveGeoName(dest.stateId, statesById),
    regionName: resolveGeoName(dest.regionId, regionsById),
    categoryLabel: resolveCategoryLabel(dest.categoryIds, categoriesById),
  }));
}

export function sortDestinations(
  items: DestinationListRow[],
  sortBy: DestinationListFilters["sortBy"] = "updatedAt",
  sortDir: DestinationListFilters["sortDir"] = "desc"
): DestinationListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "slug":
        return a.slug.localeCompare(b.slug) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "createdAt":
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case "updatedAt":
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    }
  });
}

export function paginateDestinations<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function needsClientDestinationFiltering(filters: DestinationListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.regionId ||
      filters.sortBy === "name" ||
      filters.sortBy === "slug" ||
      filters.sortBy === "status"
  );
}

export function buildGeographyLookups(countries: Country[], states: State[], regions: Region[], cities: City[]) {
  return {
    countriesById: new Map(countries.map((c) => [c.id, c])),
    statesById: new Map(states.map((s) => [s.id, s])),
    regionsById: new Map(regions.map((r) => [r.id, r])),
    citiesById: new Map(cities.map((c) => [c.id, c])),
  };
}
