import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackageVersionService } from "../module";
import type { Package } from "../types/package";
import type { PackageVersion } from "../types/package-version";

export async function listPackageVersionsHandler(packageId: string): Promise<Result<PackageVersion[], AppError>> {
  return getPackageVersionService().listByPackage(packageId);
}

export async function rollbackPackageVersionHandler(packageId: string, versionId: string): Promise<Result<Package, AppError>> {
  return getPackageVersionService().rollback(packageId, versionId);
}
