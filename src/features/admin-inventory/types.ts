import type { InventoryKind, InventoryStatus } from "./constants";

export type { InventoryKind, InventoryStatus };

export interface HotelDetails {
  starRating: number;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface FlightRouteDetails {
  originAirportCode: string;
  destinationAirportCode: string;
}

export interface ActivityDetails {
  durationMinutes: number;
  category: string;
}

export interface TransferDetails {
  mode: "FERRY" | "ROAD";
  originDestinationId: string;
  targetDestinationId: string;
}

export interface VisaDetails {
  countryId: string;
  visaType: "TOURIST" | "BUSINESS" | "TRANSIT";
  entryType: "SINGLE" | "MULTIPLE";
  processingDays: number;
  validityDays: number;
  requiredDocuments: string[];
}

export interface InsuranceDetails {
  providerName: string;
  coverageAmount: number;
  currencyCode: string;
  termDays: number;
  termsUrl?: string;
}

interface InventoryItemBase {
  id: string;
  destinationId: string | null;
  title: string;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HotelItem extends InventoryItemBase {
  kind: "HOTEL";
  details: HotelDetails;
}

export interface FlightItem extends InventoryItemBase {
  kind: "FLIGHT";
  details: FlightRouteDetails;
}

export interface ActivityItem extends InventoryItemBase {
  kind: "ACTIVITY";
  details: ActivityDetails;
}

export interface TransferItem extends InventoryItemBase {
  kind: "TRANSFER";
  details: TransferDetails;
}

export interface VisaItem extends InventoryItemBase {
  kind: "VISA";
  details: VisaDetails;
}

export interface InsuranceItem extends InventoryItemBase {
  kind: "INSURANCE";
  details: InsuranceDetails;
}

export type InventoryItem = HotelItem | FlightItem | ActivityItem | TransferItem | VisaItem | InsuranceItem;

export type InventoryListRow = InventoryItem & {
  destinationName: string;
  supplierLabel: string;
  priceLabel: string;
  availabilityLabel: string;
};

export interface PaginatedInventory {
  items: InventoryListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type InventorySortField = "updatedAt" | "createdAt" | "title" | "status" | "kind";

export type SortDirection = "asc" | "desc";

export interface InventoryListFilters {
  kind?: InventoryKind;
  destinationId?: string;
  status?: InventoryStatus;
  search?: string;
  sortBy?: InventorySortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface CreateInventoryInput {
  kind: InventoryKind;
  title: string;
  destinationId?: string | null;
  details: InventoryItem["details"];
}

export interface UpdateInventoryInput {
  title?: string;
  destinationId?: string | null;
  details?: InventoryItem["details"];
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  capabilities: string[];
  status: "ACTIVE" | "DISABLED";
  registeredAt: string;
}

export interface SupplierHealthStatus {
  healthy: boolean;
  message?: string;
  checkedAt: string;
}
