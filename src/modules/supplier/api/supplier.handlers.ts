import type { AppError } from "@/shared/errors";
import { isErr, type Result } from "@/shared/types";
import { getSupplierService } from "../module";
import type { SupplierHealthStatus, SupplierRecord } from "../types";
import { validateCapabilityParam } from "../validation/supplier-query.validation";
import type { ListSuppliersRawQuery } from "./dto";

export async function listSuppliersHandler(query: ListSuppliersRawQuery): Promise<Result<SupplierRecord[], AppError>> {
  const validated = validateCapabilityParam(query.capability);
  if (isErr(validated)) return validated;
  return getSupplierService().listSuppliers(validated.value);
}

export async function getSupplierHandler(code: string): Promise<Result<SupplierRecord, AppError>> {
  return getSupplierService().getSupplierByCode(code);
}

export async function getSupplierHealthHandler(code: string): Promise<Result<SupplierHealthStatus, AppError>> {
  return getSupplierService().getSupplierHealth(code);
}
