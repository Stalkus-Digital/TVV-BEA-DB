import type { WebsiteSeoDTO } from "./website-seo.dto";
import type { WebsiteDestinationSummaryDTO } from "./website-destination.dto";
import type { WebsitePackageSummaryDTO } from "./website-package.dto";

export interface HeroBannerDTO {
  headline: string;
  subheadline: string;
  backgroundImage: string | null;
  ctaLabel: string;
  ctaUrl: string;
}

export interface QuickLinkDTO {
  label: string;
  url: string;
}

export interface HomeSectionDTO {
  id: string;
  type: string;
  enabled: boolean;
  data: Record<string, unknown>;
}

/**
 * Public homepage payload.
 * `sections` is the page-composition source of truth for the frontend.
 * `heroBanner` / catalog shelves remain for legacy clients and shelf data.
 */
export interface HomepageResponseDTO {
  sections: HomeSectionDTO[];
  heroBanner: HeroBannerDTO;
  featuredPackages: WebsitePackageSummaryDTO[];
  featuredDestinations: WebsiteDestinationSummaryDTO[];
  popularDestinations: WebsiteDestinationSummaryDTO[];
  latestPackages: WebsitePackageSummaryDTO[];
  quickLinks: QuickLinkDTO[];
  seo: WebsiteSeoDTO;
}
