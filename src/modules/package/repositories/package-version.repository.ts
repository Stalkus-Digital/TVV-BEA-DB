import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageVersion } from "../types/package-version";
import { InMemoryStore } from "./in-memory-store";

export interface PackageVersionRepository extends BaseRepository<PackageVersion, string> {
  findByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>>;
  findLatest(packageId: string): Promise<Result<PackageVersion | null, AppError>>;
}

export class InMemoryPackageVersionRepository implements PackageVersionRepository {
  private readonly store = new InMemoryStore<PackageVersion>("Package version");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackageVersion, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackageVersion, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((v) => v.packageId === packageId)
        .sort((a, b) => b.versionNumber - a.versionNumber)
    );
  }

  async findLatest(packageId: string): Promise<Result<PackageVersion | null, AppError>> {
    const versions = this.store.all().filter((v) => v.packageId === packageId);
    if (versions.length === 0) return ok(null);
    return ok(versions.reduce((latest, v) => (v.versionNumber > latest.versionNumber ? v : latest)));
  }
}
