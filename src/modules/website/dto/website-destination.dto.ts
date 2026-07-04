import type { WebsiteBreadcrumbDTO, WebsiteSeoDTO } from "./website-seo.dto";
import type { WebsitePackageSummaryDTO } from "./website-package.dto";

export interface WebsiteDestinationSummaryDTO {
  slug: string;
  name: string;
  heroImage: string | null;
}

export interface WebsiteDestinationFaqDTO {
  question: string;
  answer: string;
}

/**
 * `guides: []` is always empty — CMS doesn't exist yet (Sprint 9). The field
 * stays on the DTO because the brief asks for it and the frontend contract
 * should be stable now; the array is genuinely empty, never fabricated.
 */
export interface WebsiteDestinationDetailDTO extends WebsiteDestinationSummaryDTO {
  gallery: string[];
  faqs: WebsiteDestinationFaqDTO[];
  guides: never[];
  featuredPackages: WebsitePackageSummaryDTO[];
  nearbyDestinations: WebsiteDestinationSummaryDTO[];
  breadcrumbs: WebsiteBreadcrumbDTO[];
  seo: WebsiteSeoDTO;
}
