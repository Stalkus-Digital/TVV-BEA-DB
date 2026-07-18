import type { Destination } from "@/features/admin-destinations/types";
import type { Package } from "@/features/admin-packages/types";
import type { InventoryItem } from "../types";
import { paginateInventory } from "../utils";
import { CATALOG_ENTITY_LABELS } from "./constants";
import type { CatalogListFilters, CatalogListRow, CatalogSortField } from "./types";

export function mapInventoryToCatalogRow(
  item: InventoryItem,
  destinationsById: Map<string, { name: string }>
): CatalogListRow {
  return {
    id: item.id,
    entityType: item.kind,
    title: item.title,
    status: item.status,
    destinationId: item.destinationId,
    destinationName: item.destinationId
      ? destinationsById.get(item.destinationId)?.name ?? "—"
      : "—",
    supplierLabel: "—",
    priceLabel: "—",
    availabilityLabel: "—",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function mapDestinationToCatalogRow(destination: Destination): CatalogListRow {
  return {
    id: destination.id,
    entityType: "DESTINATION",
    title: destination.name,
    status: destination.status,
    destinationId: destination.id,
    destinationName: destination.name,
    supplierLabel: "—",
    priceLabel: "—",
    availabilityLabel: "—",
    createdAt: destination.createdAt,
    updatedAt: destination.updatedAt,
  };
}

export function mapPackageToCatalogRow(
  pkg: Package,
  destinationsById: Map<string, { name: string }>
): CatalogListRow {
  return {
    id: pkg.id,
    entityType: "PACKAGE",
    title: pkg.title,
    status: pkg.status,
    destinationId: pkg.destinationId,
    destinationName: destinationsById.get(pkg.destinationId)?.name ?? "—",
    supplierLabel: "—",
    priceLabel: "—",
    availabilityLabel: "—",
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
}

export function applyCatalogSearch(rows: CatalogListRow[], search?: string): CatalogListRow[] {
  const query = search?.trim().toLowerCase();
  if (!query) return rows;

  return rows.filter(
    (row) =>
      row.title.toLowerCase().includes(query) ||
      row.id.toLowerCase().includes(query) ||
      row.entityType.toLowerCase().includes(query) ||
      CATALOG_ENTITY_LABELS[row.entityType].toLowerCase().includes(query) ||
      row.destinationName.toLowerCase().includes(query)
  );
}

export function applyCatalogTypeFilter(
  rows: CatalogListRow[],
  kind?: CatalogListFilters["kind"]
): CatalogListRow[] {
  if (!kind) return rows;
  return rows.filter((row) => row.entityType === kind);
}

export function applyCatalogStatusFilter(
  rows: CatalogListRow[],
  status?: CatalogListFilters["status"]
): CatalogListRow[] {
  if (!status) return rows;
  return rows.filter((row) => row.status === status);
}

export function applyCatalogDestinationFilter(
  rows: CatalogListRow[],
  destinationId?: string
): CatalogListRow[] {
  if (!destinationId) return rows;
  return rows.filter((row) => {
    if (row.entityType === "DESTINATION") return row.id === destinationId;
    return row.destinationId === destinationId;
  });
}

export function sortCatalog(
  rows: CatalogListRow[],
  sortBy: CatalogSortField = "updatedAt",
  sortDir: CatalogListFilters["sortDir"] = "desc"
): CatalogListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "kind":
        return a.entityType.localeCompare(b.entityType) * dir;
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

export function paginateCatalog(rows: CatalogListRow[], page: number, pageSize: number) {
  return paginateInventory(rows, page, pageSize);
}
