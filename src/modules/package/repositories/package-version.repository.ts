import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PackageVersion } from "../types/package-version";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageVersionRepository extends BaseRepository<PackageVersion, string> {
  findByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>>;
  findLatest(packageId: string): Promise<Result<PackageVersion | null, AppError>>;
}

export class PrismaPackageVersionRepository extends PrismaStore<any> implements PackageVersionRepository {
  constructor() {
    super(prisma.packageVersion);
  }

  async findByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( v: any ) => v.packageId === packageId)
        .sort(( a: any, b: any ) => b.versionNumber - a.versionNumber)
    );
  }

  async findLatest(packageId: string): Promise<Result<PackageVersion | null, AppError>> {
    const versions = (await this.delegate.findMany()).filter(( v: any ) => v.packageId === packageId);
    if (versions.length === 0) return ok(null);
    return ok(versions.reduce((latest: any, v: any) => (v.versionNumber > latest.versionNumber ? v : latest)));
  }
}
