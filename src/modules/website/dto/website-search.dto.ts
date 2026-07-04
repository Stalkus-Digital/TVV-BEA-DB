import type { WebsitePackageSummaryDTO } from "./website-package.dto";

export interface WebsiteSearchQuery {
  keyword?: string;
  destinationSlug?: string;
  minDurationDays?: number;
  maxDurationDays?: number;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  packageType?: string;
  page?: number;
  pageSize?: number;
}

export interface WebsiteSearchResultDTO {
  results: WebsitePackageSummaryDTO[];
  total: number;
  page: number;
  pageSize: number;
}
