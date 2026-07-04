import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import {
  getAIPackageBuilder,
  getDynamicPackageBuilder,
  getManualPackageBuilder,
  getMixedPackageBuilder,
  getSupplierPackageBuilder,
} from "../module";
import type { Package } from "../types/package";

export async function buildManualPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getManualPackageBuilder().build(body);
}

export async function buildDynamicPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getDynamicPackageBuilder().build(body);
}

export async function buildAIPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getAIPackageBuilder().build(body);
}

export async function buildSupplierPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getSupplierPackageBuilder().build(body);
}

export async function buildMixedPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getMixedPackageBuilder().build(body);
}
