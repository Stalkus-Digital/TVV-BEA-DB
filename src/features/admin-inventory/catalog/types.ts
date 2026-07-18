import type { InventoryKind, InventoryStatus, SortDirection } from "../types";

export type CatalogEntityType = InventoryKind | "DESTINATION" | "PACKAGE";

export type CatalogStatus = string;

export interface CatalogListRow {
  id: string;
  entityType: CatalogEntityType;
  title: string;
  status: CatalogStatus;
  destinationId: string | null;
  destinationName: string;
  supplierLabel: string;
  priceLabel: string;
  availabilityLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCatalog {
  items: CatalogListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type CatalogSortField = "updatedAt" | "createdAt" | "title" | "status" | "kind";

export interface CatalogListFilters {
  kind?: CatalogEntityType;
  destinationId?: string;
  status?: InventoryStatus | string;
  search?: string;
  sortBy?: CatalogSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}
