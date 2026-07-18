import type { DestinationFaqEntry, DestinationSeo } from "@/features/admin-destinations/types";
import type { PackageFaqEntry, PackageSeo } from "@/features/admin-packages/types";

export type { DestinationFaqEntry, DestinationSeo, PackageFaqEntry, PackageSeo };

export interface HeroBanner {
  headline: string;
  subheadline: string;
  backgroundImage: string | null;
  ctaLabel: string;
  ctaUrl: string;
}

export interface QuickLink {
  label: string;
  url: string;
}

export interface WebsiteSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
}

export interface WebsitePackageSummary {
  id: string;
  title: string;
  slug: string;
  destinationName: string;
  durationDays: number;
  durationNights: number;
  fromPrice: number | null;
  currency: string;
  heroImage: string | null;
}

export interface WebsiteDestinationSummary {
  id: string;
  name: string;
  slug: string;
  heroImage: string | null;
  shortDescription: string | null;
}

export interface HomepageResponse {
  heroBanner: HeroBanner;
  featuredPackages: WebsitePackageSummary[];
  featuredDestinations: WebsiteDestinationSummary[];
  popularDestinations: WebsiteDestinationSummary[];
  latestPackages: WebsitePackageSummary[];
  quickLinks: QuickLink[];
  seo: WebsiteSeo;
}

export interface MenuItem {
  label: string;
  url: string;
  children?: MenuItem[];
}

export interface FooterColumn {
  title: string;
  links: MenuItem[];
}

export interface NavigationResponse {
  menu: MenuItem[];
  footer: { columns: FooterColumn[] };
  quickLinks: QuickLink[];
  popularDestinations: WebsiteDestinationSummary[];
  /** CMS Pages → Add to nav (merged into public header as top-level links) */
  customNavLinks?: MenuItem[];
}

export type StorageCategory =
  | "PROFILE_IMAGE"
  | "PACKAGE_IMAGE"
  | "DESTINATION_IMAGE"
  | "GALLERY_IMAGE"
  | "INVOICE"
  | "VOUCHER"
  | "PASSPORT"
  | "VISA"
  | "INSURANCE"
  | "TRAVEL_DOCUMENT";

export type StorageVisibility = "PUBLIC" | "PRIVATE";

export interface StorageObject {
  key: string;
  url: string;
  category: StorageCategory;
  visibility: StorageVisibility;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface UploadStorageInput {
  file: File;
  category: StorageCategory;
  ownerId: string;
  fileName?: string;
}

export interface DeleteStorageInput {
  category: StorageCategory;
  key: string;
  ownerId: string;
}

export interface FaqListItem {
  id: string;
  question: string;
  answer: string;
  position: number;
  parentType: "destination" | "package";
  parentId: string;
  parentName: string;
  parentSlug: string;
}

export interface SeoListItem {
  id: string;
  type: "destination" | "package";
  name: string;
  slug: string;
  seo: DestinationSeo | PackageSeo;
  updatedAt: string;
}

export interface CmsDashboardStats {
  featuredDestinationCount: number;
  publishedPackageCount: number;
  destinationFaqCount: number;
  packageFaqCount: number;
  heroConfigured: boolean;
  menuItemCount: number;
  footerLinkCount: number;
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  position?: number;
}

export interface UpdateSeoInput {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
}
