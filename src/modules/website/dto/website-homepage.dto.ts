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

/**
 * heroBanner is a static, config-driven placeholder — there is no CMS
 * (Sprint 9) to author it from yet. popularDestinations is a provisional
 * proxy (currently: same source as featured, first N) — real popularity
 * needs booking-count analytics that don't exist before Booking Engine.
 * Both are flagged in docs/09_WEBSITE_API.md, not silently presented as if
 * backed by real content/analytics.
 */
export interface HomepageResponseDTO {
  heroBanner: HeroBannerDTO;
  featuredPackages: WebsitePackageSummaryDTO[];
  featuredDestinations: WebsiteDestinationSummaryDTO[];
  popularDestinations: WebsiteDestinationSummaryDTO[];
  latestPackages: WebsitePackageSummaryDTO[];
  quickLinks: QuickLinkDTO[];
  seo: WebsiteSeoDTO;
}
