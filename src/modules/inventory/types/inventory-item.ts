import type { InventoryKind } from "./inventory-kind";
import type { InventoryStatus } from "./inventory-status";
import type {
  ActivityDetails,
  FlightRouteDetails,
  HotelDetails,
  InsuranceDetails,
  TransferDetails,
  VisaDetails,
} from "./kinds";

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

/**
 * The one polymorphic type every other module (Package Builder, Bookings,
 * and eventually the Supplier Engine) references — per docs/02's
 * "Inventory Driven" principle, everything sellable is an instance of this
 * union. No supplier-specific field exists anywhere in it (see module.ts /
 * README notes on provider-agnosticism).
 */
export type InventoryItem = HotelItem | FlightItem | ActivityItem | TransferItem | VisaItem | InsuranceItem;

export type InventoryItemDetails = InventoryItem["details"];

export type InventoryItemOfKind<K extends InventoryKind> = Extract<InventoryItem, { kind: K }>;
