import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { SUPPLIER_CAPABILITIES, type SupplierCapability } from "../types";

export function validateCapabilityParam(
  value: string | null | undefined
): Result<SupplierCapability | undefined, ValidationError> {
  if (!value) return ok(undefined);
  if (!SUPPLIER_CAPABILITIES.includes(value as SupplierCapability)) {
    return err(new ValidationError(`capability must be one of: ${SUPPLIER_CAPABILITIES.join(", ")}`));
  }
  return ok(value as SupplierCapability);
}
