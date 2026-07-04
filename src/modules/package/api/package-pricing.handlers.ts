import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackagePricingService } from "../module";
import type { PackagePricing, PriceComputeResult } from "../types/package-pricing";

export async function getPackagePricingHandler(packageId: string): Promise<Result<PackagePricing, AppError>> {
  return getPackagePricingService().getByPackage(packageId);
}

export async function upsertPackagePricingHandler(packageId: string, body: unknown): Promise<Result<PackagePricing, AppError>> {
  return getPackagePricingService().upsert(packageId, body);
}

export async function computePackagePriceHandler(packageId: string, body: unknown): Promise<Result<PriceComputeResult, AppError>> {
  return getPackagePricingService().compute(packageId, body);
}
