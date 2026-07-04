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
import type { Destination } from "../types/destination";

export interface DestinationListFilter extends PaginationParams {
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  parentDestinationId?: string | null;
  featured?: boolean;
}

export interface DestinationRepository extends BaseRepository<Destination, string> {
  findBySlug(slug: string): Promise<Result<Destination | null, AppError>>;
  findByFilter(filter: DestinationListFilter): Promise<Result<PaginatedResult<Destination>, AppError>>;
  findChildren(parentDestinationId: string): Promise<Result<Destination[], AppError>>;
}

/** In-memory — no database yet, same pattern as Inventory's and Supplier's repositories. */
export class InMemoryDestinationRepository implements DestinationRepository {
  private readonly store = new Map<string, Destination>();

  async findById(id: string): Promise<Result<Destination | null, AppError>> {
    return ok(this.store.get(id) ?? null);
  }

  async findBySlug(slug: string): Promise<Result<Destination | null, AppError>> {
    return ok(Array.from(this.store.values()).find((d) => d.slug === slug) ?? null);
  }

  async findChildren(parentDestinationId: string): Promise<Result<Destination[], AppError>> {
    return ok(Array.from(this.store.values()).filter((d) => d.parentDestinationId === parentDestinationId));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Destination>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: DestinationListFilter): Promise<Result<PaginatedResult<Destination>, AppError>> {
    let items = Array.from(this.store.values());
    if (filter.countryId) items = items.filter((d) => d.countryId === filter.countryId);
    if (filter.stateId) items = items.filter((d) => d.stateId === filter.stateId);
    if (filter.cityId) items = items.filter((d) => d.cityId === filter.cityId);
    if (filter.categoryId) items = items.filter((d) => d.categoryIds.includes(filter.categoryId as string));
    if (filter.parentDestinationId !== undefined) {
      items = items.filter((d) => d.parentDestinationId === filter.parentDestinationId);
    }
    if (filter.featured !== undefined) items = items.filter((d) => d.isFeatured === filter.featured);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async create(data: Omit<Destination, "id">): Promise<Result<Destination, AppError>> {
    const id = randomUUID();
    const record = { ...data, id } as Destination;
    this.store.set(id, record);
    return ok(record);
  }

  async update(id: string, data: Partial<Omit<Destination, "id">>): Promise<Result<Destination, AppError>> {
    const existing = this.store.get(id);
    if (!existing) return err(new NotFoundError(`Destination "${id}" not found`));
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() } as Destination;
    this.store.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    if (!this.store.has(id)) return err(new NotFoundError(`Destination "${id}" not found`));
    this.store.delete(id);
    return ok(undefined);
  }
}
