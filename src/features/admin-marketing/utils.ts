import type { Enquiry } from "@/features/admin-enquiries/types";
import type { Destination } from "@/features/admin-destinations/types";
import type { Package } from "@/features/admin-packages/types";
import type {
  ConversionFunnel,
  FormStatistics,
  LandingPageRow,
  LeadStatistics,
  SeoListItem,
  HomepageResponse,
} from "./types";

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildLeadStatistics(enquiries: Enquiry[]): LeadStatistics {
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let newThisWeek = 0;

  for (const enquiry of enquiries) {
    byStatus[enquiry.status] = (byStatus[enquiry.status] ?? 0) + 1;
    byType[enquiry.type] = (byType[enquiry.type] ?? 0) + 1;
    if (new Date(enquiry.createdAt).getTime() >= weekAgo) newThisWeek += 1;
  }

  return { total: enquiries.length, byStatus, byType, newThisWeek };
}

export function buildConversionFunnel(
  enquiryCount: number,
  quoteCount: number,
  bookingCount: number
): ConversionFunnel {
  return {
    enquiries: enquiryCount,
    quotes: quoteCount,
    bookings: bookingCount,
    enquiryToQuoteRate: enquiryCount > 0 ? quoteCount / enquiryCount : null,
    quoteToBookingRate: quoteCount > 0 ? bookingCount / quoteCount : null,
  };
}

export function buildFormStatistics(
  enquiries: Enquiry[],
  quotes: { status: string }[]
): FormStatistics {
  const enquiryByType: Record<string, number> = {};
  const enquiryByStatus: Record<string, number> = {};
  for (const enquiry of enquiries) {
    enquiryByType[enquiry.type] = (enquiryByType[enquiry.type] ?? 0) + 1;
    enquiryByStatus[enquiry.status] = (enquiryByStatus[enquiry.status] ?? 0) + 1;
  }

  const quoteByStatus: Record<string, number> = {};
  for (const quote of quotes) {
    quoteByStatus[quote.status] = (quoteByStatus[quote.status] ?? 0) + 1;
  }

  return {
    enquiryTotal: enquiries.length,
    enquiryByType,
    enquiryByStatus,
    quoteTotal: quotes.length,
    quoteByStatus,
    convertedEnquiries: enquiryByStatus.CONVERTED ?? 0,
  };
}

export function getMissingSeoFields(seo: { metaTitle?: string; metaDescription?: string; focusKeyword?: string }): string[] {
  const missing: string[] = [];
  if (!seo.metaTitle) missing.push("metaTitle");
  if (!seo.metaDescription) missing.push("metaDescription");
  if (!seo.focusKeyword) missing.push("focusKeyword");
  return missing;
}

export function buildSeoList(destinations: Destination[], packages: Package[]): SeoListItem[] {
  const destinationItems: SeoListItem[] = destinations.map((destination) => ({
    id: destination.id,
    type: "destination",
    name: destination.name,
    slug: destination.slug,
    seo: destination.seo,
    websiteSeoTitle: destination.seo.metaTitle ?? null,
    updatedAt: destination.updatedAt,
    missingFields: getMissingSeoFields(destination.seo),
  }));

  const packageItems: SeoListItem[] = packages.map((pkg) => ({
    id: pkg.id,
    type: "package",
    name: pkg.title,
    slug: pkg.slug,
    seo: pkg.seo,
    websiteSeoTitle: pkg.seo.metaTitle ?? null,
    updatedAt: pkg.updatedAt,
    missingFields: getMissingSeoFields(pkg.seo),
  }));

  return [...destinationItems, ...packageItems].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildLandingPages(
  home: HomepageResponse | undefined,
  websitePackages: import("./types").WebsitePackageSummary[],
  websiteDestinations: import("./types").WebsiteDestinationSummary[],
  adminPackages: Package[],
  adminDestinations: Destination[],
  staticRoutes: { label: string; url: string }[]
): LandingPageRow[] {
  const packageBySlug = new Map(adminPackages.map((p) => [p.slug, p]));
  const destinationBySlug = new Map(adminDestinations.map((d) => [d.slug, d]));
  const rows: LandingPageRow[] = [];

  if (home) {
    rows.push({
      id: "home",
      type: "home",
      title: home.seo.title || "Homepage",
      slug: "/",
      path: "/",
      seoTitle: home.seo.title,
      seoDescription: home.seo.description,
      publishedLabel: "Public (Website BFF)",
      previewPath: "/",
    });
  }

  for (const pkg of websitePackages) {
    const admin = packageBySlug.get(pkg.slug);
    rows.push({
      id: `package-${pkg.slug}`,
      type: "package",
      title: pkg.title,
      slug: pkg.slug,
      path: `/packages/${pkg.slug}`,
      seoTitle: admin?.seo.metaTitle ?? null,
      seoDescription: admin?.seo.metaDescription ?? null,
      publishedLabel: admin?.status === "PUBLISHED" ? "Published" : "On website (published)",
      previewPath: `/packages/${pkg.slug}`,
    });
  }

  for (const dest of websiteDestinations) {
    const admin = destinationBySlug.get(dest.slug);
    rows.push({
      id: `destination-${dest.slug}`,
      type: "destination",
      title: dest.name,
      slug: dest.slug,
      path: `/destinations/${dest.slug}`,
      seoTitle: admin?.seo.metaTitle ?? null,
      seoDescription: admin?.seo.metaDescription ?? null,
      publishedLabel: admin?.status ?? "Listed on website",
      previewPath: `/destinations/${dest.slug}`,
    });
  }

  const seenUrls = new Set<string>();
  for (const route of staticRoutes) {
    if (route.url === "/" || route.url.startsWith("/packages") || route.url.startsWith("/destinations")) continue;
    if (seenUrls.has(route.url)) continue;
    seenUrls.add(route.url);
    rows.push({
      id: `static-${route.url}`,
      type: "static",
      title: route.label,
      slug: route.url,
      path: route.url,
      seoTitle: null,
      seoDescription: null,
      publishedLabel: "Static (navigation menu)",
      previewPath: route.url,
    });
  }

  return rows;
}

export function formatRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}
