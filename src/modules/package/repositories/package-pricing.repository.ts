import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackagePricing } from "../types/package-pricing";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackagePricingRepository extends BaseRepository<PackagePricing, string> {
  findByPackage(packageId: string): Promise<Result<PackagePricing | null, AppError>>;
}

export class PrismaPackagePricingRepository extends PrismaStore<any> implements PackagePricingRepository {
  constructor() {
    super(prisma.packagePricing);
  }

  async findByPackage(packageId: string): Promise<Result<PackagePricing | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( p: any ) => p.packageId === packageId) ?? null);
  }
}
