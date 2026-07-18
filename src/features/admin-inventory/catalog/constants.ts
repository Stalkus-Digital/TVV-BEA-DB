import { INVENTORY_KIND_LABELS, INVENTORY_KINDS, InventoryKind } from "../constants";
import type { CatalogEntityType } from "./types";

export const CATALOG_EXTRA_TYPES = ["DESTINATION", "PACKAGE"] as const;

export const CATALOG_ENTITY_TYPES: CatalogEntityType[] = [
  ...INVENTORY_KINDS,
  ...CATALOG_EXTRA_TYPES,
];

export const CATALOG_ENTITY_LABELS: Record<CatalogEntityType, string> = {
  ...INVENTORY_KIND_LABELS,
  DESTINATION: "Destination",
  PACKAGE: "Holiday Package",
};

export function isInventoryKind(type: CatalogEntityType): type is InventoryKind {
  return (INVENTORY_KINDS as string[]).includes(type);
}

export function isCatalogExtraType(type: string): type is (typeof CATALOG_EXTRA_TYPES)[number] {
  return (CATALOG_EXTRA_TYPES as readonly string[]).includes(type);
}
