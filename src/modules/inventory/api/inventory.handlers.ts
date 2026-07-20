import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getInventoryService } from "../module";
import { InventoryStatus, type InventoryItem } from "../types";
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

export async function publishInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().publish(id);
}

export async function unpublishInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().unpublish(id);
}

export async function restoreInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().restore(id);
}

export async function duplicateInventoryItemHandler(id: string): Promise<Result<InventoryItem, AppError>> {
  return getInventoryService().duplicate(id);
}

export async function bulkUpdateInventoryStatusHandler(
  body: unknown
): Promise<Result<{ updated: number }, AppError>> {
  const data = body as { ids?: string[]; status?: InventoryStatus } | null;
  const ids = Array.isArray(data?.ids) ? data.ids : [];
  return getInventoryService().bulkUpdateStatus(ids, data?.status ?? InventoryStatus.DRAFT);
}

export async function bulkArchiveInventoryHandler(body: unknown): Promise<Result<{ archived: number }, AppError>> {
  const data = body as { ids?: string[] } | null;
  return getInventoryService().bulkArchive(Array.isArray(data?.ids) ? data.ids : []);
}

export async function deleteInventoryItemHandler(id: string): Promise<Result<void, AppError>> {
  return getInventoryService().delete(id);
}
