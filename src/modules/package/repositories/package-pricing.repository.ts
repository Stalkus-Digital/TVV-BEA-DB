import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackagePricing } from "../types/package-pricing";
import { InMemoryStore } from "./in-memory-store";

export interface PackagePricingRepository extends BaseRepository<PackagePricing, string> {
  findByPackage(packageId: string): Promise<Result<PackagePricing | null, AppError>>;
}

export class InMemoryPackagePricingRepository implements PackagePricingRepository {
  private readonly store = new InMemoryStore<PackagePricing>("Package pricing");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackagePricing, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackagePricing, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByPackage(packageId: string): Promise<Result<PackagePricing | null, AppError>> {
    return ok(this.store.all().find((p) => p.packageId === packageId) ?? null);
  }
}
