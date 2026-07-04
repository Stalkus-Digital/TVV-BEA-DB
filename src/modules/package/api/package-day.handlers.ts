import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackageDayService, getPackageItemService } from "../module";
import type { PackageDay } from "../types/package-day";
import type { PackageItem } from "../types/package-item";

export async function listPackageDaysHandler(packageId: string): Promise<Result<PackageDay[], AppError>> {
  return getPackageDayService().listByPackage(packageId);
}

export async function addPackageDayHandler(packageId: string, body: unknown): Promise<Result<PackageDay, AppError>> {
  return getPackageDayService().addDay(packageId, body);
}

export async function updatePackageDayHandler(dayId: string, body: unknown): Promise<Result<PackageDay, AppError>> {
  return getPackageDayService().updateDay(dayId, body);
}

export async function removePackageDayHandler(dayId: string): Promise<Result<void, AppError>> {
  return getPackageDayService().removeDay(dayId);
}

export async function addPackageItemHandler(dayId: string, body: unknown): Promise<Result<PackageItem, AppError>> {
  return getPackageItemService().addItem(dayId, body);
}

export async function removePackageItemHandler(itemId: string): Promise<Result<void, AppError>> {
  return getPackageItemService().removeItem(itemId);
}
