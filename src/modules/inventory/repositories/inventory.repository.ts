import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAGINATION,
  err,
  ok,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationParams,
  type Result,
} from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { InventoryItem, InventoryKind } from "../types";

export interface InventoryRepository extends BaseRepository<InventoryItem, string> {
  findByKind(
    kind: InventoryKind,
    params?: PaginationParams
  ): Promise<Result<PaginatedResult<InventoryItem>, AppError>>;
}

/**
 * In-memory implementation — no database exists yet (Prisma + PostgreSQL are
 * decided but not installed, per CLAUDE.md). Swapping this for a
 * Prisma-backed repository later means implementing InventoryRepository
 * again; nothing that depends on the interface (the service, the API
 * handlers) needs to change.
 */
export class InMemoryInventoryRepository implements InventoryRepository {
  private readonly store = new Map<string, InventoryItem>();

  async findById(id: string): Promise<Result<InventoryItem | null, AppError>> {
    return ok(this.store.get(id) ?? null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    return ok(this.paginate(Array.from(this.store.values()), params));
  }

  async findByKind(
    kind: InventoryKind,
    params: PaginationParams = {}
  ): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    const items = Array.from(this.store.values()).filter((item) => item.kind === kind);
    return ok(this.paginate(items, params));
  }

  async create(data: Omit<InventoryItem, "id">): Promise<Result<InventoryItem, AppError>> {
    const id = randomUUID();
    // Safe: `data` was already validated into a correctly-correlated
    // kind/details pair by the validation layer before reaching here.
    const item = { ...data, id } as InventoryItem;
    this.store.set(id, item);
    return ok(item);
  }

  async update(id: string, data: Partial<Omit<InventoryItem, "id">>): Promise<Result<InventoryItem, AppError>> {
    const existing = this.store.get(id);
    if (!existing) return err(new NotFoundError(`Inventory item "${id}" not found`));
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() } as InventoryItem;
    this.store.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    if (!this.store.has(id)) return err(new NotFoundError(`Inventory item "${id}" not found`));
    this.store.delete(id);
    return ok(undefined);
  }

  private paginate(items: InventoryItem[], params: PaginationParams): PaginatedResult<InventoryItem> {
    const page = params.page ?? DEFAULT_PAGINATION.page;
    const pageSize = params.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return toPaginatedResult(paged, items.length, { page, pageSize });
  }
}
