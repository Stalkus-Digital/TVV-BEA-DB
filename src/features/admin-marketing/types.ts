import type { Enquiry } from "@/features/admin-enquiries/types";
import type { DestinationSeo } from "@/features/admin-destinations/types";
import type { PackageSeo } from "@/features/admin-packages/types";

export interface WebsiteSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
}

export interface WebsitePackageSummary {
  slug: string;
  title: string;
  destinationName: string;
  destinationSlug: string;
  durationDays: number;
  durationNights: number;
  fromPrice: number | null;
  currency: string | null;
  heroImage: string | null;
}

export interface WebsiteDestinationSummary {
  slug: string;
  name: string;
  heroImage: string | null;
}

export interface HomepageResponse {
  heroBanner: {
    headline: string;
    subheadline: string;
    backgroundImage: string | null;
    ctaLabel: string;
    ctaUrl: string;
  };
  featuredPackages: WebsitePackageSummary[];
  featuredDestinations: WebsiteDestinationSummary[];
  popularDestinations: WebsiteDestinationSummary[];
  latestPackages: WebsitePackageSummary[];
  quickLinks: { label: string; url: string }[];
  seo: WebsiteSeo;
}

export interface WebsitePackageDetail {
  slug: string;
  title: string;
  seo: WebsiteSeo;
}

export interface WebsiteDestinationDetail {
  slug: string;
  name: string;
  seo: WebsiteSeo;
}

export interface LeadStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  newThisWeek: number;
}

export interface ConversionFunnel {
  enquiries: number;
  quotes: number;
  bookings: number;
  enquiryToQuoteRate: number | null;
  quoteToBookingRate: number | null;
}

export interface FormStatistics {
  enquiryTotal: number;
  enquiryByType: Record<string, number>;
  enquiryByStatus: Record<string, number>;
  quoteTotal: number;
  quoteByStatus: Record<string, number>;
  convertedEnquiries: number;
}

export interface SeoListItem {
  id: string;
  type: "destination" | "package";
  name: string;
  slug: string;
  seo: DestinationSeo | PackageSeo;
  websiteSeoTitle: string | null;
  updatedAt: string;
  missingFields: string[];
}

export interface LandingPageRow {
  id: string;
  type: "home" | "package" | "destination" | "static";
  title: string;
  slug: string;
  path: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedLabel: string;
  previewPath: string;
}

export interface MarketingDashboardData {
  leads: LeadStatistics;
  funnel: ConversionFunnel;
  recentEnquiries: Enquiry[];
  recentQuotes: { id: string; title: string; quoteNumber: string; status: string; createdAt: string }[];
  websiteTrafficAvailable: boolean;
  websiteTraffic?: { totalViews: number; uniqueVisitors: number; totalSessions: number };
  topDestinationsAvailable: boolean;
  topPackagesAvailable: boolean;
  topPages?: { path: string; views: number }[];
  featuredDestinations: WebsiteDestinationSummary[];
  featuredPackages: WebsitePackageSummary[];
}
