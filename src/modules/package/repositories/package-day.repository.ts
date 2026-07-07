import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageDay } from "../types/package-day";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageDayRepository extends BaseRepository<PackageDay, string> {
  findByPackage(packageId: string): Promise<Result<PackageDay[], AppError>>;
}

export class PrismaPackageDayRepository extends PrismaStore<any> implements PackageDayRepository {
  constructor() {
    super(prisma.packageDay);
  }

  async findByPackage(packageId: string): Promise<Result<PackageDay[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( d: any ) => d.packageId === packageId)
        .sort(( a: any, b: any ) => a.dayNumber - b.dayNumber)
    );
  }
}
