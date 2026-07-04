import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import type { Package } from "../types/package";
import type { PackageVersion } from "../types/package-version";
import type { PackageVersionRepository } from "../repositories/package-version.repository";
import type { PackageRepository } from "../repositories/package.repository";

/**
 * Pure version bookkeeping — snapshot ASSEMBLY (gathering days/items/
 * pricing/rules into one payload) happens in package.service.ts's
 * publish(), which has access to every repository; this service only
 * persists/lists/rolls back the resulting immutable records.
 */
export class PackageVersionService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly versions: PackageVersionRepository,
    private readonly packages: PackageRepository
  ) {
    super(context);
  }

  async listByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>> {
    return this.versions.findByPackage(packageId);
  }

  async createVersion(packageId: string, snapshot: unknown, changeNote: string | null): Promise<Result<PackageVersion, AppError>> {
    const latest = await this.versions.findLatest(packageId);
    if (isErr(latest)) return latest;

    const versionNumber = (latest.value?.versionNumber ?? 0) + 1;
    this.logger.info("Creating package version", { packageId, versionNumber });

    return this.versions.create({
      packageId,
      versionNumber,
      snapshot,
      publishedAt: new Date().toISOString(),
      changeNote,
    });
  }

  async rollback(packageId: string, versionId: string): Promise<Result<Package, AppError>> {
    const version = await this.versions.findById(versionId);
    if (isErr(version)) return version;
    if (!version.value) return err(new NotFoundError(`Package version "${versionId}" not found`));
    if (version.value.packageId !== packageId) {
      return err(new ConflictError(`Version "${versionId}" does not belong to package "${packageId}"`));
    }

    this.logger.info("Rolling back package to version", { packageId, versionId, versionNumber: version.value.versionNumber });
    return this.packages.update(packageId, { currentVersionId: versionId, updatedAt: new Date().toISOString() });
  }
}
