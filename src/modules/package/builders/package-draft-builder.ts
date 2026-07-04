import { isErr, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { Package } from "../types/package";
import type { PackageService } from "../services/package.service";
import type { PackageDayService } from "../services/package-day.service";
import type { PackageItemService } from "../services/package-item.service";
import type { PackageDraft } from "./package-draft";

/**
 * The single orchestration path every builder (Manual/Dynamic/AI/Supplier/
 * Mixed) delegates to after shaping its own input into a PackageDraft. Not
 * a service itself — it composes three that already exist, in the same
 * create-package → add-days → add-items order a human using the API by
 * hand would.
 */
export class PackageDraftBuilder {
  constructor(
    private readonly packages: PackageService,
    private readonly days: PackageDayService,
    private readonly items: PackageItemService
  ) {}

  async build(draft: PackageDraft): Promise<Result<Package, AppError>> {
    // code/slug are omitted, not defaulted to the raw title, when the
    // builder input doesn't supply them — PackageService.create()'s own
    // validation derives a normalized (slugified, uppercased) default from
    // the title. Passing the raw title through here bypassed that
    // derivation and broke on any title containing spaces.
    const created = await this.packages.create({
      title: draft.title,
      ...(draft.code ? { code: draft.code } : {}),
      ...(draft.slug ? { slug: draft.slug } : {}),
      destinationId: draft.destinationId,
      sourceType: draft.sourceType,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights,
    });
    if (isErr(created)) return created;

    for (const dayInput of draft.days) {
      const day = await this.days.addDay(created.value.id, {
        dayNumber: dayInput.dayNumber,
        title: dayInput.title,
        description: dayInput.description ?? null,
        destinationId: dayInput.destinationId ?? null,
      });
      if (isErr(day)) return day;

      for (const itemInput of dayInput.items) {
        const item = await this.items.addItem(day.value.id, itemInput);
        if (isErr(item)) return item;
      }
    }

    return this.packages.getById(created.value.id);
  }
}
