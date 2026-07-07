import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageRule } from "../types/package-rule";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageRuleRepository extends BaseRepository<PackageRule, string> {
  findByPackage(packageId: string): Promise<Result<PackageRule | null, AppError>>;
}

export class PrismaPackageRuleRepository extends PrismaStore<any> implements PackageRuleRepository {
  constructor() {
    super(prisma.packageRule);
  }

  async findByPackage(packageId: string): Promise<Result<PackageRule | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( r: any ) => r.packageId === packageId) ?? null);
  }
}
