import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageRule } from "../types/package-rule";
import { InMemoryStore } from "./in-memory-store";

export interface PackageRuleRepository extends BaseRepository<PackageRule, string> {
  findByPackage(packageId: string): Promise<Result<PackageRule | null, AppError>>;
}

export class InMemoryPackageRuleRepository implements PackageRuleRepository {
  private readonly store = new InMemoryStore<PackageRule>("Package rule");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackageRule, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackageRule, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByPackage(packageId: string): Promise<Result<PackageRule | null, AppError>> {
    return ok(this.store.all().find((r) => r.packageId === packageId) ?? null);
  }
}
