import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { AdjustmentType, type PriceAdjustment } from "../types/package-pricing";

function validateAdjustment(input: unknown, field: string): Result<PriceAdjustment | null, ValidationError> {
  if (input === undefined || input === null) return ok(null);
  if (typeof input !== "object") return err(new ValidationError(`${field} must be an object`));
  const { type, value } = input as Record<string, unknown>;
  if (typeof type !== "string" || !Object.values(AdjustmentType).includes(type as AdjustmentType)) {
    return err(new ValidationError(`${field}.type must be one of: ${Object.values(AdjustmentType).join(", ")}`));
  }
  if (typeof value !== "number" || value < 0) {
    return err(new ValidationError(`${field}.value must be a non-negative number`));
  }
  return ok({ type: type as AdjustmentType, value });
}

export interface UpdatePricingInput {
  basePrice: number;
  currency: string;
  markup: PriceAdjustment | null;
  discount: (PriceAdjustment & { validFrom?: string; validTo?: string }) | null;
  tax: (PriceAdjustment & { label?: string }) | null;
}

export function validateUpdatePricing(input: unknown): Result<UpdatePricingInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (typeof body.basePrice !== "number" || body.basePrice < 0) {
    return err(new ValidationError("basePrice must be a non-negative number"));
  }
  if (typeof body.currency !== "string" || body.currency.trim().length !== 3) {
    return err(new ValidationError("currency must be a 3-letter code"));
  }

  const markup = validateAdjustment(body.markup, "markup");
  if (!markup.ok) return markup;
  const discountBase = validateAdjustment(body.discount, "discount");
  if (!discountBase.ok) return discountBase;
  const taxBase = validateAdjustment(body.tax, "tax");
  if (!taxBase.ok) return taxBase;

  return ok({
    basePrice: body.basePrice,
    currency: body.currency.toUpperCase(),
    markup: markup.value,
    discount: discountBase.value,
    tax: taxBase.value,
  });
}

export interface ComputePriceInput {
  date?: string;
  adults: number;
  children?: { age: number }[];
  infants?: number;
}

export function validateComputePriceRequest(input: unknown): Result<ComputePriceInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { date, adults, children, infants } = input as Record<string, unknown>;

  if (typeof adults !== "number" || adults <= 0) return err(new ValidationError("adults must be a positive number"));
  if (date !== undefined && typeof date !== "string") return err(new ValidationError("date must be a string"));
  if (children !== undefined) {
    if (!Array.isArray(children) || !children.every((c) => typeof c === "object" && c !== null && typeof c.age === "number")) {
      return err(new ValidationError("children must be an array of { age: number }"));
    }
  }
  if (infants !== undefined && (typeof infants !== "number" || infants < 0)) {
    return err(new ValidationError("infants must be a non-negative number"));
  }

  return ok({
    date: date as string | undefined,
    adults,
    children: children as { age: number }[] | undefined,
    infants: infants as number | undefined,
  });
}
