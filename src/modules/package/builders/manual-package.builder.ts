import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import { PackageItemResolutionMode } from "../types/package-item";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft } from "./package-draft";

/** Ops specifies every day/item by hand — all items default to PINNED unless the caller says otherwise. */
export class ManualPackageBuilder {
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
      sourceType: PackageSourceType.MANUAL,
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
