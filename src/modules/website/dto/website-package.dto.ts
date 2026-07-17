import type { PackageTripType } from "@/modules/package/constants/trip-type";
import type { WebsiteBreadcrumbDTO, WebsiteSeoDTO } from "./website-seo.dto";
import type { WebsiteDestinationSummaryDTO } from "./website-destination.dto";

/**
 * Never the internal `Package`/`PackagePreview` entity — every field here
 * is one this sprint's brief explicitly asked the website to be able to
 * show a customer. Internal fields (currentVersionId, sourceTemplateId,
 * aiGeneratedFromId, isTemplate, raw pricing rules/markup/tax) never appear.
 */
export interface WebsitePackageSummaryDTO {
  id: string;
  slug: string;
  title: string;
  destinationName: string;
  destinationSlug: string;
  durationDays: number;
  durationNights: number;
  fromPrice: number | null;
  currency: string | null;
  heroImage: string | null;
  tripType: PackageTripType | null;
  tripTypeLabel: string | null;
}

export interface WebsitePackageItemDTO {
  kind: string;
  title: string;
  description: string | null;
  timeOfDay: string | null;
  images: string[];
}

export interface WebsitePackageDayDTO {
  dayNumber: number;
  title: string;
  description: string | null;
  items: WebsitePackageItemDTO[];
}

export interface WebsitePackagePricingDTO {
  currency: string;
  basePrice: number;
  fromPrice: number | null;
}

export interface WebsitePackageFaqDTO {
  question: string;
  answer: string;
}

export interface WebsitePackageDetailDTO extends WebsitePackageSummaryDTO {
  itinerary: WebsitePackageDayDTO[];
  pricing: WebsitePackagePricingDTO | null;
  gallery: string[];
  faqs: WebsitePackageFaqDTO[];
  relatedPackages: WebsitePackageSummaryDTO[];
  destinationSummary: WebsiteDestinationSummaryDTO | null;
  seo: WebsiteSeoDTO;
  breadcrumbs: WebsiteBreadcrumbDTO[];
}
