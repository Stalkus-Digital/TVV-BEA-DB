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
import type { SupplierRecord } from "../types";

export interface SupplierRecordRepository extends BaseRepository<SupplierRecord, string> {
  findByCode(code: string): Promise<Result<SupplierRecord | null, AppError>>;
}

/**
 * In-memory — no database exists yet, same pattern as Inventory's
 * repository (src/modules/inventory/repositories/inventory.repository.ts).
 */
export class InMemorySupplierRecordRepository implements SupplierRecordRepository {
  private readonly store = new Map<string, SupplierRecord>();

  async findById(id: string): Promise<Result<SupplierRecord | null, AppError>> {
    return ok(this.store.get(id) ?? null);
  }

  async findByCode(code: string): Promise<Result<SupplierRecord | null, AppError>> {
    const found = Array.from(this.store.values()).find((record) => record.code === code);
    return ok(found ?? null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<SupplierRecord>, AppError>> {
    const items = Array.from(this.store.values());
    const page = params.page ?? DEFAULT_PAGINATION.page;
    const pageSize = params.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async create(data: Omit<SupplierRecord, "id">): Promise<Result<SupplierRecord, AppError>> {
    const id = randomUUID();
    const record = { ...data, id } as SupplierRecord;
    this.store.set(id, record);
    return ok(record);
  }

  async update(id: string, data: Partial<Omit<SupplierRecord, "id">>): Promise<Result<SupplierRecord, AppError>> {
    const existing = this.store.get(id);
    if (!existing) return err(new NotFoundError(`Supplier record "${id}" not found`));
    const updated = { ...existing, ...data } as SupplierRecord;
    this.store.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    if (!this.store.has(id)) return err(new NotFoundError(`Supplier record "${id}" not found`));
    this.store.delete(id);
    return ok(undefined);
  }
}
