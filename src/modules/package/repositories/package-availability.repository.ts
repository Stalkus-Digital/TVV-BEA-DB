import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageAvailability } from "../types/package-availability";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageAvailabilityRepository extends BaseRepository<PackageAvailability, string> {
  findByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>>;
}

export class PrismaPackageAvailabilityRepository extends PrismaStore<any> implements PackageAvailabilityRepository {
  constructor() {
    super(prisma.packageAvailability);
  }

  async findByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( a: any ) => a.packageId === packageId));
  }
}
