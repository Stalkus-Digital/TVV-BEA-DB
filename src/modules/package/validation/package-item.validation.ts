import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import {
  INVENTORY_REFERENCING_KINDS,
  PACKAGE_ITEM_KINDS,
  PackageItemKind,
  PackageItemPricingMode,
  PackageItemResolutionMode,
} from "../types/package-item";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CreateItemInput {
  kind: PackageItemKind;
  resolutionMode: PackageItemResolutionMode;
  inventoryItemId: string | null;
  destinationReferenceId: string | null;
  slotCriteria: Record<string, unknown> | null;
  title: string;
  description: string | null;
  timeOfDay: string | null;
  notes: string | null;
  images: string[];
  pricingMode: PackageItemPricingMode;
  addonPrice: number | null;
}

/**
 * The per-kind reference rule this sprint's "Duplicate Inventory" and
 * general item validation is built on: DESTINATION items must carry
 * destinationReferenceId (never inventoryItemId); the six
 * INVENTORY_REFERENCING_KINDS must carry inventoryItemId when PINNED (never
 * destinationReferenceId); MEALS carries neither. Existence of the
 * referenced record is checked by the service layer (via Inventory/
 * Destination's public service accessors), not here — this function only
 * validates shape.
 */
export function validateCreateItem(input: unknown): Result<CreateItemInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (typeof body.kind !== "string" || !PACKAGE_ITEM_KINDS.includes(body.kind as PackageItemKind)) {
    return err(new ValidationError(`kind must be one of: ${PACKAGE_ITEM_KINDS.join(", ")}`));
  }
  const kind = body.kind as PackageItemKind;

  const resolutionMode = (body.resolutionMode as string | undefined) ?? PackageItemResolutionMode.PINNED;
  if (!Object.values(PackageItemResolutionMode).includes(resolutionMode as PackageItemResolutionMode)) {
    return err(new ValidationError(`resolutionMode must be one of: ${Object.values(PackageItemResolutionMode).join(", ")}`));
  }

  if (!isNonEmptyString(body.title)) return err(new ValidationError("title is required"));

  let inventoryItemId: string | null = null;
  let destinationReferenceId: string | null = null;
  let slotCriteria: Record<string, unknown> | null = null;

  if (resolutionMode === PackageItemResolutionMode.SLOT) {
    if (typeof body.slotCriteria !== "object" || body.slotCriteria === null) {
      return err(new ValidationError("slotCriteria is required when resolutionMode is SLOT"));
    }
    slotCriteria = body.slotCriteria as Record<string, unknown>;
  } else if (kind === PackageItemKind.DESTINATION) {
    if (!isNonEmptyString(body.destinationReferenceId)) {
      return err(new ValidationError("destinationReferenceId is required for a PINNED DESTINATION item"));
    }
    destinationReferenceId = body.destinationReferenceId;
  } else if (INVENTORY_REFERENCING_KINDS.includes(kind)) {
    if (!isNonEmptyString(body.inventoryItemId)) {
      return err(new ValidationError(`inventoryItemId is required for a PINNED ${kind} item`));
    }
    inventoryItemId = body.inventoryItemId;
  }
  // MEALS + PINNED: no reference required at all.

  if (body.images !== undefined && (!Array.isArray(body.images) || !body.images.every((i) => typeof i === "string"))) {
    return err(new ValidationError("images must be an array of strings"));
  }

  const pricingMode = (body.pricingMode as string | undefined) ?? PackageItemPricingMode.INCLUDED;
  if (!Object.values(PackageItemPricingMode).includes(pricingMode as PackageItemPricingMode)) {
    return err(new ValidationError(`pricingMode must be one of: ${Object.values(PackageItemPricingMode).join(", ")}`));
  }
  if (pricingMode === PackageItemPricingMode.ADDON && typeof body.addonPrice !== "number") {
    return err(new ValidationError("addonPrice is required when pricingMode is ADDON"));
  }

  for (const [field, value] of Object.entries({ description: body.description, timeOfDay: body.timeOfDay, notes: body.notes })) {
    if (value !== undefined && value !== null && typeof value !== "string") {
      return err(new ValidationError(`${field} must be a string or null`));
    }
  }

  return ok({
    kind,
    resolutionMode: resolutionMode as PackageItemResolutionMode,
    inventoryItemId,
    destinationReferenceId,
    slotCriteria,
    title: body.title as string,
    description: (body.description as string | null | undefined) ?? null,
    timeOfDay: (body.timeOfDay as string | null | undefined) ?? null,
    notes: (body.notes as string | null | undefined) ?? null,
    images: (body.images as string[] | undefined) ?? [],
    pricingMode: pricingMode as PackageItemPricingMode,
    addonPrice: (body.addonPrice as number | null | undefined) ?? null,
  });
}
