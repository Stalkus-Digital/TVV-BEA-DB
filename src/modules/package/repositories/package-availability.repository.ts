import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageAvailability } from "../types/package-availability";
import { InMemoryStore } from "./in-memory-store";

export interface PackageAvailabilityRepository extends BaseRepository<PackageAvailability, string> {
  findByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>>;
}

export class InMemoryPackageAvailabilityRepository implements PackageAvailabilityRepository {
  private readonly store = new InMemoryStore<PackageAvailability>("Package availability");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PackageAvailability, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PackageAvailability, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>> {
    return ok(this.store.all().filter((a) => a.packageId === packageId));
  }
}
