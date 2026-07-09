import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type {
  CreateInventoryInput,
  InventoryItem,
  InventoryListFilters,
  SupplierHealthStatus,
  SupplierRecord,
  UpdateInventoryInput,
} from "../types";

function inventoryPath(id: string) {
  return `${adminEndpoints.inventory}/${id}`;
}

export async function fetchInventory(filters: InventoryListFilters = {}): Promise<PaginatedResult<InventoryItem>> {
  const result = await adminApiClient.get<PaginatedResult<InventoryItem>>(adminEndpoints.inventory, {
    params: {
      kind: filters.kind,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllInventory(filters: Pick<InventoryListFilters, "kind"> = {}): Promise<InventoryItem[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: InventoryItem[] = [];

  while (page <= totalPages) {
    const result = await fetchInventory({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchInventoryItem(id: string): Promise<InventoryItem> {
  const result = await adminApiClient.get<InventoryItem>(inventoryPath(id));
  if (!result) throw new Error("Inventory item not found");
  return result;
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<InventoryItem> {
  const result = await adminApiClient.post<InventoryItem>(adminEndpoints.inventory, input);
  if (!result) throw new Error("Failed to create inventory item");
  return result;
}

export async function updateInventoryItem(id: string, input: UpdateInventoryInput): Promise<InventoryItem> {
  const result = await adminApiClient.patch<InventoryItem>(inventoryPath(id), input);
  if (!result) throw new Error("Failed to update inventory item");
  return result;
}

export async function archiveInventoryItem(id: string): Promise<InventoryItem> {
  const result = await adminApiClient.delete<InventoryItem>(inventoryPath(id));
  if (!result) throw new Error("Failed to archive inventory item");
  return result;
}

export async function fetchSuppliers(): Promise<SupplierRecord[]> {
  const result = await adminApiClient.get<SupplierRecord[]>("/api/suppliers");
  return result ?? [];
}

export async function fetchSupplierHealth(code: string): Promise<SupplierHealthStatus> {
  const result = await adminApiClient.get<SupplierHealthStatus>(`/api/suppliers/${code}/health`);
  if (!result) throw new Error("Failed to load supplier health");
  return result;
}
