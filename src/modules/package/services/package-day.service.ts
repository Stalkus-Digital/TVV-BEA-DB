import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import type { PackageDay } from "../types/package-day";
import type { PackageDayRepository } from "../repositories/package-day.repository";
import { validateCreateDay, validateUpdateDay } from "../validation/package-day.validation";

export class PackageDayService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: PackageDayRepository
  ) {
    super(context);
  }

  async listByPackage(packageId: string): Promise<Result<PackageDay[], AppError>> {
    return this.repository.findByPackage(packageId);
  }

  async getById(id: string): Promise<Result<PackageDay, AppError>> {
    const result = await this.repository.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Package day "${id}" not found`));
    return ok(result.value);
  }

  async addDay(packageId: string, input: unknown): Promise<Result<PackageDay, AppError>> {
    const validated = validateCreateDay(input);
    if (isErr(validated)) return validated;

    if (validated.value.destinationId) {
      const destination = await getDestinationService().getById(validated.value.destinationId);
      if (isErr(destination)) return destination;
    }

    this.logger.info("Adding package day", { packageId, dayNumber: validated.value.dayNumber });
    const now = new Date().toISOString();
    return this.repository.create({ packageId, ...validated.value, createdAt: now, updatedAt: now });
  }

  async updateDay(id: string, input: unknown): Promise<Result<PackageDay, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateUpdateDay(input);
    if (isErr(validated)) return validated;
    this.logger.info("Updating package day", { id });
    return this.repository.update(id, { ...validated.value, updatedAt: new Date().toISOString() });
  }

  async removeDay(id: string): Promise<Result<void, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Removing package day", { id });
    return this.repository.delete(id);
  }
}
