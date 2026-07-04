import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { QuoteItemKind } from "../types/quote-item";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** kind is derived from which reference id is present, not trusted from the body — a caller can't claim PACKAGE while passing no packageId. */
function deriveKind(packageId: string | null, inventoryItemId: string | null): Result<typeof QuoteItemKind[keyof typeof QuoteItemKind], ValidationError> {
  if (packageId && inventoryItemId) return err(new ValidationError("A quote item may reference either packageId or inventoryItemId, not both"));
  if (packageId) return ok(QuoteItemKind.PACKAGE);
  if (inventoryItemId) return ok(QuoteItemKind.INVENTORY);
  return ok(QuoteItemKind.CUSTOM);
}

export interface CreateQuoteItemInput {
  kind: (typeof QuoteItemKind)[keyof typeof QuoteItemKind];
  packageId: string | null;
  inventoryItemId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  position?: number;
}

export function validateCreateQuoteItem(input: unknown): Result<CreateQuoteItemInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (body.packageId !== undefined && body.packageId !== null && !isNonEmptyString(body.packageId)) {
    return err(new ValidationError("packageId must be a string"));
  }
  if (body.inventoryItemId !== undefined && body.inventoryItemId !== null && !isNonEmptyString(body.inventoryItemId)) {
    return err(new ValidationError("inventoryItemId must be a string"));
  }
  const packageId = (body.packageId as string | null | undefined) ?? null;
  const inventoryItemId = (body.inventoryItemId as string | null | undefined) ?? null;

  const kind = deriveKind(packageId, inventoryItemId);
  if (!kind.ok) return kind;

  if (!isNonEmptyString(body.title)) return err(new ValidationError("title is required"));
  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    return err(new ValidationError("description must be a string"));
  }
  if (typeof body.quantity !== "number" || body.quantity <= 0) return err(new ValidationError("quantity must be a positive number"));
  if (typeof body.unitPrice !== "number" || body.unitPrice < 0) return err(new ValidationError("unitPrice must be a non-negative number"));
  if (body.position !== undefined && typeof body.position !== "number") return err(new ValidationError("position must be a number"));

  return ok({
    kind: kind.value,
    packageId,
    inventoryItemId,
    title: body.title as string,
    description: (body.description as string | undefined) ?? null,
    quantity: body.quantity,
    unitPrice: body.unitPrice,
    position: body.position as number | undefined,
  });
}

export interface UpdateQuoteItemInput {
  title?: string;
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  position?: number;
}

export function validateUpdateQuoteItem(input: unknown): Result<UpdateQuoteItemInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateQuoteItemInput = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) return err(new ValidationError("title must be a non-empty string"));
    output.title = body.title;
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") return err(new ValidationError("description must be a string or null"));
    output.description = body.description as string | null;
  }
  if (body.quantity !== undefined) {
    if (typeof body.quantity !== "number" || body.quantity <= 0) return err(new ValidationError("quantity must be a positive number"));
    output.quantity = body.quantity;
  }
  if (body.unitPrice !== undefined) {
    if (typeof body.unitPrice !== "number" || body.unitPrice < 0) return err(new ValidationError("unitPrice must be a non-negative number"));
    output.unitPrice = body.unitPrice;
  }
  if (body.position !== undefined) {
    if (typeof body.position !== "number") return err(new ValidationError("position must be a number"));
    output.position = body.position;
  }

  return ok(output);
}
