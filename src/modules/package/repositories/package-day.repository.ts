import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageDay } from "../types/package-day";
import { InMemoryStore } from "./in-memory-store";

export interface PackageDayRepository extends BaseRepository<PackageDay, string> {
  findByPackage(packageId: string): Promise<Result<PackageDay[], AppError>>;
}

export class InMemoryPackageDayRepository implements PackageDayRepository {
  private readonly store = new InMemoryStore<PackageDay>("Package day");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackageDay, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackageDay, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByPackage(packageId: string): Promise<Result<PackageDay[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((d) => d.packageId === packageId)
        .sort((a, b) => a.dayNumber - b.dayNumber)
    );
  }
}
