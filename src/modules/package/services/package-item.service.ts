import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { getInventoryService } from "@/modules/inventory";
import { getDestinationService } from "@/modules/destination";
import { PackageItemKind, type PackageItem } from "../types/package-item";
import type { PackageItemRepository } from "../repositories/package-item.repository";
import type { PackageDayRepository } from "../repositories/package-day.repository";
import { validateCreateItem } from "../validation/package-item.validation";

/**
 * Owns two things this sprint's brief calls out explicitly: the
 * PINNED-item existence check against Inventory/Destination (the approved
 * cross-module direction, per docs/02 — "Package Builder ↓ Inventory
 * Service" / "↓ Destination Engine"), and the "Duplicate Inventory"
 * validation rule (the same inventoryItemId can't appear twice in one
 * package).
 */
export class PackageItemService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly items: PackageItemRepository,
    private readonly days: PackageDayRepository
  ) {
    super(context);
  }

  async listByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>> {
    return this.items.findByDay(packageDayId);
  }

  async getById(id: string): Promise<Result<PackageItem, AppError>> {
    const result = await this.items.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Package item "${id}" not found`));
    return ok(result.value);
  }

  async addItem(packageDayId: string, input: unknown): Promise<Result<PackageItem, AppError>> {
    const day = await this.days.findById(packageDayId);
    if (isErr(day)) return day;
    if (!day.value) return err(new NotFoundError(`Package day "${packageDayId}" not found`));

    const validated = validateCreateItem(input);
    if (isErr(validated)) return validated;

    const referenceCheck = await this.assertReferencesExist(validated.value);
    if (isErr(referenceCheck)) return referenceCheck;

    if (validated.value.inventoryItemId) {
      const duplicateCheck = await this.assertNoDuplicateInventory(day.value.packageId, validated.value.inventoryItemId);
      if (isErr(duplicateCheck)) return duplicateCheck;
    }

    const existingItems = await this.items.findByDay(packageDayId);
    if (isErr(existingItems)) return existingItems;

    this.logger.info("Adding package item", { packageDayId, kind: validated.value.kind });
    const now = new Date().toISOString();
    return this.items.create({
      packageDayId,
      ...validated.value,
      position: existingItems.value.length,
      createdAt: now,
      updatedAt: now,
    });
  }

  async removeItem(id: string): Promise<Result<void, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Removing package item", { id });
    return this.items.delete(id);
  }

  private async assertReferencesExist(item: {
    kind: PackageItemKind;
    inventoryItemId: string | null;
    destinationReferenceId: string | null;
  }): Promise<Result<void, AppError>> {
    if (item.inventoryItemId) {
      const inventoryResult = await getInventoryService().getById(item.inventoryItemId);
      if (isErr(inventoryResult)) return inventoryResult;
    }
    if (item.destinationReferenceId) {
      const destinationResult = await getDestinationService().getById(item.destinationReferenceId);
      if (isErr(destinationResult)) return destinationResult;
    }
    return ok(undefined);
  }

  /** "Duplicate Inventory" validation rule — same inventoryItemId cannot appear twice across a package's days. */
  private async assertNoDuplicateInventory(packageId: string, inventoryItemId: string): Promise<Result<void, AppError>> {
    const days = await this.days.findByPackage(packageId);
    if (isErr(days)) return days;
    const dayIds = days.value.map((d) => d.id);

    const items = await this.items.findByDays(dayIds);
    if (isErr(items)) return items;

    const alreadyUsed = items.value.some((i) => i.inventoryItemId === inventoryItemId);
    if (alreadyUsed) {
      return err(new ConflictError(`Inventory item "${inventoryItemId}" is already used elsewhere in this package`));
    }
    return ok(undefined);
  }
}
