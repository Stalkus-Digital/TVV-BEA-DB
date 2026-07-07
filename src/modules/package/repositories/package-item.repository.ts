import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageItem } from "../types/package-item";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageItemRepository extends BaseRepository<PackageItem, string> {
  findByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>>;
  findByDays(packageDayIds: string[]): Promise<Result<PackageItem[], AppError>>;
}

export class PrismaPackageItemRepository extends PrismaStore<any> implements PackageItemRepository {
  constructor() {
    super(prisma.packageItem);
  }

  async findByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( i: any ) => i.packageDayId === packageDayId)
        .sort(( a: any, b: any ) => a.position - b.position)
    );
  }

  /** Used to assemble a whole package's items across all its days in one query, and for the duplicate-inventory check. */
  async findByDays(packageDayIds: string[]): Promise<Result<PackageItem[], AppError>> {
    const dayIdSet = new Set(packageDayIds);
    return ok((await this.delegate.findMany()).filter(( i: any ) => dayIdSet.has(i.packageDayId)));
  }
}
