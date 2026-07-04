import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft } from "./package-draft";

/**
 * Unlike Manual/AI/Supplier (which default every item's resolutionMode to
 * PINNED) and Dynamic (which forces SLOT on every item), Mixed does not
 * touch resolutionMode at all — the caller specifies PINNED or SLOT
 * per-item explicitly, an intentional combination.
 */
export class MixedPackageBuilder {
  constructor(private readonly draftBuilder: PackageDraftBuilder) {}

  async build(input: unknown): Promise<Result<Package, AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const draft = input as Partial<PackageDraft>;
    if (!draft.title || !draft.destinationId || !draft.durationDays || !Array.isArray(draft.days)) {
      return err(new ValidationError("title, destinationId, durationDays, and days are required"));
    }
    for (const day of draft.days) {
      for (const item of day.items) {
        if (!item.resolutionMode) {
          return err(new ValidationError("Every item must specify resolutionMode explicitly for a Mixed package"));
        }
      }
    }

    const shaped: PackageDraft = {
      ...draft,
      title: draft.title,
      destinationId: draft.destinationId,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights ?? Math.max(0, draft.durationDays - 1),
      sourceType: PackageSourceType.MIXED,
      days: draft.days,
    };

    return this.draftBuilder.build(shaped);
  }
}
