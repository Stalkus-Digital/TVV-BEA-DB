import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import { PackageItemResolutionMode } from "../types/package-item";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft, PackageDraftDayInput } from "./package-draft";

interface DynamicBuilderDayInput extends Omit<PackageDraftDayInput, "items"> {
  items: Omit<PackageDraftDayInput["items"][number], "resolutionMode" | "inventoryItemId" | "destinationReferenceId">[];
}

interface DynamicBuilderInput extends Omit<PackageDraft, "sourceType" | "days"> {
  days: DynamicBuilderDayInput[];
}

/**
 * Every item is forced to SLOT, regardless of what the caller sends — a
 * Dynamic package is defined entirely by criteria, resolved later (once a
 * future sprint wires Supplier Engine search into Inventory). No
 * inventoryItemId/destinationReferenceId is ever accepted here, only
 * slotCriteria.
 */
export class DynamicPackageBuilder {
  constructor(private readonly draftBuilder: PackageDraftBuilder) {}

  async build(input: unknown): Promise<Result<Package, AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const draft = input as Partial<DynamicBuilderInput>;
    if (!draft.title || !draft.destinationId || !draft.durationDays || !Array.isArray(draft.days)) {
      return err(new ValidationError("title, destinationId, durationDays, and days are required"));
    }

    const shaped: PackageDraft = {
      title: draft.title,
      code: draft.code,
      slug: draft.slug,
      destinationId: draft.destinationId,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights ?? Math.max(0, draft.durationDays - 1),
      sourceType: PackageSourceType.DYNAMIC,
      days: draft.days.map((day) => ({
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        destinationId: day.destinationId,
        items: day.items.map((item) => ({
          ...item,
          resolutionMode: PackageItemResolutionMode.SLOT,
          inventoryItemId: null,
          destinationReferenceId: null,
        })),
      })),
    };

    return this.draftBuilder.build(shaped);
  }
}
