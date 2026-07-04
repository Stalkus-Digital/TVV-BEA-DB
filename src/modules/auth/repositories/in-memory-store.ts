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
import { NotFoundError, type AppError } from "@/shared/errors";

/** Internal helper, not exported from repositories/index.ts — same in-memory-CRUD pattern hand-rolled per module as every other module's own repositories (no database yet). */
export class InMemoryStore<T extends { id: string }> {
  private readonly store = new Map<string, T>();

  constructor(private readonly entityLabel: string) {}

  async findById(id: string): Promise<Result<T | null, AppError>> {
    return ok(this.store.get(id) ?? null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<T>, AppError>> {
    const items = Array.from(this.store.values());
    const page = params.page ?? DEFAULT_PAGINATION.page;
    const pageSize = params.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async create(data: Omit<T, "id">): Promise<Result<T, AppError>> {
    const id = randomUUID();
    const record = { ...data, id } as T;
    this.store.set(id, record);
    return ok(record);
  }

  async update(id: string, data: Partial<Omit<T, "id">>): Promise<Result<T, AppError>> {
    const existing = this.store.get(id);
    if (!existing) return err(new NotFoundError(`${this.entityLabel} "${id}" not found`));
    const updated = { ...existing, ...data } as T;
    this.store.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    if (!this.store.has(id)) return err(new NotFoundError(`${this.entityLabel} "${id}" not found`));
    this.store.delete(id);
    return ok(undefined);
  }

  all(): T[] {
    return Array.from(this.store.values());
  }
}
