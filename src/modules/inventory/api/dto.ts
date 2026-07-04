import type { InventoryKind } from "../types";

/**
 * These describe the shape callers should send — the actual runtime gate is
 * the validation layer (validateCreateInventoryItem/validateUpdateInventoryItem),
 * since request bodies arrive as `unknown`, not already-trusted objects.
 */
export interface CreateInventoryItemRequestBody {
  kind: InventoryKind;
  destinationId?: string | null;
  title: string;
  details: unknown;
}

export interface UpdateInventoryItemRequestBody {
  title?: string;
  destinationId?: string | null;
  details?: unknown;
}

export interface ListInventoryQuery {
  kind?: InventoryKind;
  page?: number;
  pageSize?: number;
}
