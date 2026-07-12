import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getInventoryService } from "../module";
import type { InventoryItem } from "../types";
import type { ListInventoryQuery } from "./dto";

/**
 * Framework-agnostic handlers — no Next.js/NextRequest type appears here.
 * The thin route.ts files under src/app/api/inventory/* parse the request,
 * call these, and convert the Result into an HTTP response via src/api/http.
 */

export async function listInventoryHandler(
  query: ListInventoryQuery
): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
  return getInventoryService().list(query);
}

export async function getInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().getById(id);
}

export async function createInventoryItemHandler(body: unknown): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().create(body);
}

export async function updateInventoryItemHandler(
  id: string,
  body: unknown
): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().update(id, body);
}

export async function archiveInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().archive(id);
}

export async function deleteInventoryItemHandler(id: string): Promise<Result<void, AppError>> {
  return getInventoryService().delete(id);
}
