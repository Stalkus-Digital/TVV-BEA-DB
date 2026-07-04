import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getWebsitePackageService } from "../module";
import type { WebsitePackageDetailDTO, WebsitePackageSummaryDTO } from "../dto/website-package.dto";

export async function listWebsitePackagesHandler(filter: {
  destinationSlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<Result<{ items: WebsitePackageSummaryDTO[]; total: number; page: number; pageSize: number }, AppError>> {
  return getWebsitePackageService().listPackages(filter);
}

export async function getWebsitePackageDetailHandler(slug: string): Promise<Result<WebsitePackageDetailDTO, AppError>> {
  return getWebsitePackageService().getPackageDetail(slug);
}
