import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { PackageAvailability } from "../types/package-availability";
import type { PackageAvailabilityRepository } from "../repositories/package-availability.repository";
import { validateCreateAvailability } from "../validation/package-availability.validation";

export class PackageAvailabilityService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: PackageAvailabilityRepository
  ) {
    super(context);
  }

  async listByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>> {
    return this.repository.findByPackage(packageId);
  }

  async addWindow(packageId: string, input: unknown): Promise<Result<PackageAvailability, AppError>> {
    const validated = validateCreateAvailability(input);
    if (isErr(validated)) return validated;
    this.logger.info("Adding package availability window", { packageId });
    const now = new Date().toISOString();
    return this.repository.create({ packageId, ...validated.value, createdAt: now, updatedAt: now });
  }

  /** Real check, not a stub: a date is available if it falls in at least one window and isn't blacked out in that window. */
  async isAvailableOn(packageId: string, date: string): Promise<Result<boolean, AppError>> {
    const windows = await this.repository.findByPackage(packageId);
    if (isErr(windows)) return windows;

    const target = new Date(date).getTime();
    const available = windows.value.some((w) => {
      const inRange = target >= new Date(w.validFrom).getTime() && target <= new Date(w.validTo).getTime();
      const blackedOut = w.blackoutDates.some((b) => new Date(b).getTime() === target);
      return inRange && !blackedOut;
    });

    return ok(available);
  }
}
