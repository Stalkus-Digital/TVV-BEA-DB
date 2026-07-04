import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageItem } from "../types/package-item";
import { InMemoryStore } from "./in-memory-store";

export interface PackageItemRepository extends BaseRepository<PackageItem, string> {
  findByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>>;
  findByDays(packageDayIds: string[]): Promise<Result<PackageItem[], AppError>>;
}

export class InMemoryPackageItemRepository implements PackageItemRepository {
  private readonly store = new InMemoryStore<PackageItem>("Package item");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackageItem, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackageItem, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((i) => i.packageDayId === packageDayId)
        .sort((a, b) => a.position - b.position)
    );
  }

  /** Used to assemble a whole package's items across all its days in one query, and for the duplicate-inventory check. */
  async findByDays(packageDayIds: string[]): Promise<Result<PackageItem[], AppError>> {
    const dayIdSet = new Set(packageDayIds);
    return ok(this.store.all().filter((i) => dayIdSet.has(i.packageDayId)));
  }
}
