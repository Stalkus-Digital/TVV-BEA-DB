import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackageAvailabilityService } from "../module";
import type { PackageAvailability } from "../types/package-availability";

export async function listPackageAvailabilityHandler(packageId: string): Promise<Result<PackageAvailability[], AppError>> {
  return getPackageAvailabilityService().listByPackage(packageId);
}

export async function addPackageAvailabilityHandler(packageId: string, body: unknown): Promise<Result<PackageAvailability, AppError>> {
  return getPackageAvailabilityService().addWindow(packageId, body);
}
