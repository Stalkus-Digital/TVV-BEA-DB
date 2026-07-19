import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import { PackageItemKind, PackageItemResolutionMode } from "../types/package-item";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft, PackageDraftItemInput } from "./package-draft";

interface AIDraftInput extends Omit<PackageDraft, "sourceType"> {
  aiGenerationReferenceId?: string | null;
}

function resolveItemMode(item: PackageDraftItemInput): PackageDraftItemInput {
  const kind = item.kind;
  const inventoryItemId = item.inventoryItemId?.trim() || null;

  // HOTEL / ACTIVITY / TRANSFER with a real inventory id → PINNED
  if (
    (kind === PackageItemKind.HOTEL ||
      kind === PackageItemKind.ACTIVITY ||
      kind === PackageItemKind.TRANSFER) &&
    inventoryItemId
  ) {
    return {
      ...item,
      inventoryItemId,
      resolutionMode: PackageItemResolutionMode.PINNED,
      slotCriteria: null,
    };
  }

  // Inventory-referencing kinds without an id must be SLOT (never PINNED without id)
  const needsInventory =
    kind === PackageItemKind.HOTEL ||
    kind === PackageItemKind.FLIGHT ||
    kind === PackageItemKind.TRANSFER ||
    kind === PackageItemKind.ACTIVITY ||
    kind === PackageItemKind.VISA ||
    kind === PackageItemKind.INSURANCE;

  if (needsInventory && !inventoryItemId) {
    return {
      ...item,
      inventoryItemId: null,
      resolutionMode: PackageItemResolutionMode.SLOT,
      slotCriteria: item.slotCriteria ?? {
        source: "AI_GENERATED",
        kind,
        title: item.title,
        description: item.description ?? null,
      },
    };
  }

  return {
    ...item,
    inventoryItemId,
    resolutionMode: item.resolutionMode ?? PackageItemResolutionMode.PINNED,
  };
}

/**
 * Persists an AI-generated package draft with correct PINNED/SLOT resolution.
 */
export class AIPackageBuilder {
  constructor(private readonly draftBuilder: PackageDraftBuilder) {}

  async build(input: unknown): Promise<Result<Package, AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const draft = input as Partial<AIDraftInput>;
    if (!draft.title || !draft.destinationId || !draft.durationDays || !Array.isArray(draft.days)) {
      return err(new ValidationError("title, destinationId, durationDays, and days are required"));
    }

    const usedInventoryIds = new Set<string>();

    const shaped: PackageDraft = {
      ...draft,
      title: draft.title,
      destinationId: draft.destinationId,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights ?? Math.max(0, draft.durationDays - 1),
      sourceType: PackageSourceType.AI_GENERATED,
      aiGeneratedFromId: draft.aiGenerationReferenceId ?? null,
      days: draft.days.map((day) => ({
        ...day,
        items: day.items.map((item) => {
          let resolved = resolveItemMode(item);
          // Package rules: same inventoryItemId cannot appear twice — keep first PINNED, rest SLOT
          if (
            resolved.resolutionMode === PackageItemResolutionMode.PINNED &&
            resolved.inventoryItemId
          ) {
            if (usedInventoryIds.has(resolved.inventoryItemId)) {
              resolved = {
                ...resolved,
                inventoryItemId: null,
                resolutionMode: PackageItemResolutionMode.SLOT,
                slotCriteria: {
                  source: "AI_GENERATED",
                  kind: resolved.kind,
                  title: resolved.title,
                  description: resolved.description ?? null,
                  pinnedInventoryItemId: item.inventoryItemId,
                },
              };
            } else {
              usedInventoryIds.add(resolved.inventoryItemId);
            }
          }
          return resolved;
        }),
      })),
    };

    return this.draftBuilder.build(shaped);
  }
}
