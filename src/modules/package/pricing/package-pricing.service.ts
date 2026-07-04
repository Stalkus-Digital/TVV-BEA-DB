import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { PackagePricing, PriceComputeRequest, PriceComputeResult } from "../types/package-pricing";
import type { PackagePricingRepository } from "../repositories/package-pricing.repository";
import { validateComputePriceRequest, validateUpdatePricing } from "../validation/package-pricing.validation";
import { computePrice } from "./pricing-calculator";

export class PackagePricingService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: PackagePricingRepository
  ) {
    super(context);
  }

  async getByPackage(packageId: string): Promise<Result<PackagePricing, AppError>> {
    const result = await this.repository.findByPackage(packageId);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Pricing for package "${packageId}" not found`));
    return ok(result.value);
  }

  /** Upsert — a package always has exactly one pricing record. */
  async upsert(packageId: string, input: unknown): Promise<Result<PackagePricing, AppError>> {
    const validated = validateUpdatePricing(input);
    if (isErr(validated)) return validated;

    const existing = await this.repository.findByPackage(packageId);
    if (isErr(existing)) return existing;

    const now = new Date().toISOString();
    if (existing.value) {
      this.logger.info("Updating package pricing", { packageId });
      return this.repository.update(existing.value.id, {
        ...validated.value,
        occupancyPricing: existing.value.occupancyPricing,
        childPricing: existing.value.childPricing,
        infantPricing: existing.value.infantPricing,
        groupPricing: existing.value.groupPricing,
        seasonalPricing: existing.value.seasonalPricing,
        updatedAt: now,
      });
    }

    this.logger.info("Creating package pricing", { packageId });
    return this.repository.create({
      packageId,
      ...validated.value,
      occupancyPricing: [],
      childPricing: [],
      infantPricing: null,
      groupPricing: [],
      seasonalPricing: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  async compute(packageId: string, input: unknown): Promise<Result<PriceComputeResult, AppError>> {
    const validated = validateComputePriceRequest(input);
    if (isErr(validated)) return validated;

    const pricing = await this.getByPackage(packageId);
    if (isErr(pricing)) return pricing;

    const request: PriceComputeRequest = validated.value;
    const lineItems = computePrice(pricing.value, request);
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

    return ok({
      currency: pricing.value.currency,
      basePrice: pricing.value.basePrice,
      lineItems,
      total,
    });
  }
}
