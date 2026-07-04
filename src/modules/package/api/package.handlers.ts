import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getPackageService } from "../module";
import type { Package } from "../types/package";
import type { PackagePreview } from "../types/package-preview";
import type { CloneOverridesBody, ListPackagesQuery } from "./dto";

export async function listPackagesHandler(query: ListPackagesQuery): Promise<Result<PaginatedResult<Package>, AppError>> {
  return getPackageService().list(query);
}

export async function listPackageTemplatesHandler(): Promise<Result<Package[], AppError>> {
  return getPackageService().listTemplates();
}

export async function getPackageHandler(id: string): Promise<Result<Package, AppError>> {
  return getPackageService().getById(id);
}

export async function getPackageBySlugHandler(slug: string): Promise<Result<Package, AppError>> {
  return getPackageService().getBySlug(slug);
}

export async function createPackageHandler(body: unknown): Promise<Result<Package, AppError>> {
  return getPackageService().create(body);
}

export async function updatePackageHandler(id: string, body: unknown): Promise<Result<Package, AppError>> {
  return getPackageService().update(id, body);
}

export async function archivePackageHandler(id: string): Promise<Result<Package, AppError>> {
  return getPackageService().archive(id);
}

export async function clonePackageHandler(id: string, overrides: CloneOverridesBody): Promise<Result<Package, AppError>> {
  return getPackageService().clone(id, overrides);
}

export async function duplicatePackageHandler(id: string): Promise<Result<Package, AppError>> {
  return getPackageService().duplicate(id);
}

export async function publishPackageHandler(id: string, changeNote: string | null): Promise<Result<Package, AppError>> {
  return getPackageService().publish(id, changeNote);
}

export async function previewPackageHandler(id: string): Promise<Result<PackagePreview, AppError>> {
  return getPackageService().preview(id);
}

export async function addPackageFaqHandler(id: string, body: unknown): Promise<Result<Package, AppError>> {
  return getPackageService().addFaq(id, body);
}

export async function removePackageFaqHandler(id: string, faqId: string): Promise<Result<Package, AppError>> {
  return getPackageService().removeFaq(id, faqId);
}
