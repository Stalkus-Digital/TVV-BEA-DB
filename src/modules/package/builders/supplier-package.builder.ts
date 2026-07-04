import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import { PackageItemResolutionMode } from "../types/package-item";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft } from "./package-draft";

/**
 * Accepts an already-structured draft as if it came from a supplier
 * catalog sync — this sprint does NOT call Supplier Engine or TripJack.
 * When a real supplier sync exists, it produces this same PackageDraft
 * shape (sourceType SUPPLIER, items typically PINNED to the
 * inventoryItemId the sync resolved) and hands it to this exact builder.
 */
export class SupplierPackageBuilder {
  constructor(private readonly draftBuilder: PackageDraftBuilder) {}

  async build(input: unknown): Promise<Result<Package, AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const draft = input as Partial<PackageDraft>;
    if (!draft.title || !draft.destinationId || !draft.durationDays || !Array.isArray(draft.days)) {
      return err(new ValidationError("title, destinationId, durationDays, and days are required"));
    }

    const shaped: PackageDraft = {
      ...draft,
      title: draft.title,
      destinationId: draft.destinationId,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights ?? Math.max(0, draft.durationDays - 1),
      sourceType: PackageSourceType.SUPPLIER,
      days: draft.days.map((day) => ({
        ...day,
        items: day.items.map((item) => ({
          ...item,
          resolutionMode: item.resolutionMode ?? PackageItemResolutionMode.PINNED,
        })),
      })),
    };

    return this.draftBuilder.build(shaped);
  }
}
