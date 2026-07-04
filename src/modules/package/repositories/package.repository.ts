import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Package, PackageSourceType, PackageStatus } from "../types/package";
import { InMemoryStore } from "./in-memory-store";

export interface PackageListFilter extends PaginationParams {
  destinationId?: string;
  status?: PackageStatus;
  sourceType?: PackageSourceType;
  isTemplate?: boolean;
}

export interface PackageRepository extends BaseRepository<Package, string> {
  findByCode(code: string): Promise<Result<Package | null, AppError>>;
  findBySlug(slug: string): Promise<Result<Package | null, AppError>>;
  findByFilter(filter: PackageListFilter): Promise<Result<PaginatedResult<Package>, AppError>>;
}

export class InMemoryPackageRepository implements PackageRepository {
  private readonly store = new InMemoryStore<Package>("Package");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Package, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Package, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByCode(code: string): Promise<Result<Package | null, AppError>> {
    return ok(this.store.all().find((p) => p.code === code) ?? null);
  }

  async findBySlug(slug: string): Promise<Result<Package | null, AppError>> {
    return ok(this.store.all().find((p) => p.slug === slug) ?? null);
  }

  async findByFilter(filter: PackageListFilter): Promise<Result<PaginatedResult<Package>, AppError>> {
    let items = this.store.all();
    if (filter.destinationId) items = items.filter((p) => p.destinationId === filter.destinationId);
    if (filter.status) items = items.filter((p) => p.status === filter.status);
    if (filter.sourceType) items = items.filter((p) => p.sourceType === filter.sourceType);
    if (filter.isTemplate !== undefined) items = items.filter((p) => p.isTemplate === filter.isTemplate);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
