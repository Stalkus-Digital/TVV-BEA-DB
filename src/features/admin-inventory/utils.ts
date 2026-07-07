import { InventoryKind } from "./constants";
import type { InventoryItem, InventoryListFilters, InventoryListRow } from "./types";

export function formatInventoryDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function resolveDestinationName(
  destinationId: string | null,
  destinationsById: Map<string, { name: string }>
): string {
  if (!destinationId) return "—";
  return destinationsById.get(destinationId)?.name ?? "—";
}

export function defaultDetailsForKind(kind: InventoryKind, countryId = ""): InventoryItem["details"] {
  switch (kind) {
    case InventoryKind.HOTEL:
      return { starRating: 3, address: "" };
    case InventoryKind.FLIGHT:
      return { originAirportCode: "DEL", destinationAirportCode: "BLR" };
    case InventoryKind.ACTIVITY:
      return { durationMinutes: 60, category: "General" };
    case InventoryKind.TRANSFER:
      return { mode: "ROAD", originDestinationId: "", targetDestinationId: "" };
    case InventoryKind.VISA:
      return {
        countryId: countryId || "placeholder-country",
        visaType: "TOURIST",
        entryType: "SINGLE",
        processingDays: 7,
        validityDays: 30,
        requiredDocuments: [],
      };
    case InventoryKind.INSURANCE:
      return { providerName: "", coverageAmount: 100000, currencyCode: "INR", termDays: 7 };
    default:
      return { starRating: 3, address: "" };
  }
}

export function applyInventorySearch(items: InventoryItem[], search?: string): InventoryItem[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.kind.toLowerCase().includes(query)
  );
}

export function applyInventoryStatusFilter(items: InventoryItem[], status?: InventoryListFilters["status"]): InventoryItem[] {
  if (!status) return items;
  return items.filter((item) => item.status === status);
}

export function applyInventoryDestinationFilter(items: InventoryItem[], destinationId?: string): InventoryItem[] {
  if (!destinationId) return items;
  return items.filter((item) => item.destinationId === destinationId);
}

export function enrichInventoryRows(
  items: InventoryItem[],
  destinationsById: Map<string, { name: string }>
): InventoryListRow[] {
  return items.map((item) => ({
    ...item,
    destinationName: resolveDestinationName(item.destinationId, destinationsById),
    supplierLabel: "—",
    priceLabel: "—",
    availabilityLabel: "—",
  }));
}

export function sortInventory(
  items: InventoryListRow[],
  sortBy: InventoryListFilters["sortBy"] = "updatedAt",
  sortDir: InventoryListFilters["sortDir"] = "desc"
): InventoryListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "kind":
        return a.kind.localeCompare(b.kind) * dir;
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

export function paginateInventory<T>(items: T[], page: number, pageSize: number) {
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

export function needsClientInventoryFiltering(filters: InventoryListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.destinationId ||
      filters.sortBy === "title" ||
      filters.sortBy === "status" ||
      filters.sortBy === "kind"
  );
}

export function formatDetailsSummary(item: InventoryItem): string {
  switch (item.kind) {
    case "HOTEL":
      return `${item.details.starRating}★ · ${item.details.address}`;
    case "FLIGHT":
      return `${item.details.originAirportCode} → ${item.details.destinationAirportCode}`;
    case "ACTIVITY":
      return `${item.details.durationMinutes} min · ${item.details.category}`;
    case "TRANSFER":
      return `${item.details.mode} transfer`;
    case "VISA":
      return `${item.details.visaType} · ${item.details.entryType}`;
    case "INSURANCE":
      return `${item.details.providerName || "—"} · ${item.details.currencyCode} ${item.details.coverageAmount}`;
    default:
      return "";
  }
}
