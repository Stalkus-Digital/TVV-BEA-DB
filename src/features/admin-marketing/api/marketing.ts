import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { fetchAllEnquiries } from "@/features/admin-enquiries/api/enquiries";
import { fetchAllDestinations } from "@/features/admin-destinations/api/destinations";
import { fetchAllPackages } from "@/features/admin-packages/api/packages";
import { fetchAllQuotes } from "@/features/admin-quotes/api/quotes";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type {
  FormStatistics,
  HomepageResponse,
  LandingPageRow,
  MarketingDashboardData,
  SeoListItem,
  WebsiteDestinationSummary,
  WebsitePackageSummary,
} from "../types";
import {
  buildConversionFunnel,
  buildFormStatistics,
  buildLandingPages,
  buildLeadStatistics,
  buildSeoList,
} from "../utils";

export async function fetchWebsiteHome(): Promise<HomepageResponse> {
  const result = await adminApiClient.get<HomepageResponse>("/api/website/home");
  if (!result) throw new Error("Failed to load homepage");
  return result;
}

export async function fetchWebsiteNavigation() {
  const result = await adminApiClient.get<{
    menu: { label: string; url: string }[];
    footer: { columns: { links: { label: string; url: string }[] }[] };
    quickLinks: { label: string; url: string }[];
  }>("/api/website/navigation");
  if (!result) throw new Error("Failed to load navigation");
  return result;
}

async function fetchAllWebsitePackages(): Promise<WebsitePackageSummary[]> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const items: WebsitePackageSummary[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<{
      items: WebsitePackageSummary[];
      total: number;
      page: number;
      pageSize: number;
      totalPages?: number;
    }>("/api/website/packages", { params: { page, pageSize } });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages ?? Math.ceil(result.total / pageSize);
    page += 1;
  }

  return items;
}

async function fetchAllWebsiteDestinations(): Promise<WebsiteDestinationSummary[]> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const items: WebsiteDestinationSummary[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<{
      items: WebsiteDestinationSummary[];
      total: number;
      totalPages?: number;
    }>("/api/website/destinations", { params: { page, pageSize } });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages ?? Math.ceil(result.total / pageSize);
    page += 1;
  }

  return items;
}

async function fetchBookingTotal(): Promise<number> {
  const result = await adminApiClient.get<PaginatedResult<unknown>>(adminEndpoints.bookings, {
    params: { page: 1, pageSize: 1 },
  });
  return result?.total ?? 0;
}

export async function fetchMarketingDashboard(): Promise<MarketingDashboardData> {
  const [enquiries, quotes, bookingTotal, home] = await Promise.all([
    fetchAllEnquiries(),
    fetchAllQuotes(),
    fetchBookingTotal(),
    fetchWebsiteHome(),
  ]);

  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map((quote) => ({
      id: quote.id,
      title: quote.title,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      createdAt: quote.createdAt,
    }));

  return {
    leads: buildLeadStatistics(enquiries),
    funnel: buildConversionFunnel(enquiries.length, quotes.length, bookingTotal),
    recentEnquiries,
    recentQuotes,
    websiteTrafficAvailable: false,
    topDestinationsAvailable: false,
    topPackagesAvailable: false,
    featuredDestinations: home.featuredDestinations,
    featuredPackages: home.featuredPackages,
  };
}

export async function fetchFormStatistics(): Promise<FormStatistics> {
  const [enquiries, quotes] = await Promise.all([fetchAllEnquiries(), fetchAllQuotes()]);
  return buildFormStatistics(enquiries, quotes);
}

export async function fetchSeoDashboard(): Promise<SeoListItem[]> {
  const [destinations, packages] = await Promise.all([fetchAllDestinations(), fetchAllPackages()]);
  return buildSeoList(destinations, packages);
}

export async function fetchLandingPages(): Promise<LandingPageRow[]> {
  const [home, websitePackages, websiteDestinations, adminPackages, adminDestinations, navigation] =
    await Promise.all([
      fetchWebsiteHome(),
      fetchAllWebsitePackages(),
      fetchAllWebsiteDestinations(),
      fetchAllPackages(),
      fetchAllDestinations(),
      fetchWebsiteNavigation(),
    ]);

  const staticRoutes = [
    ...navigation.menu,
    ...navigation.quickLinks,
    ...navigation.footer.columns.flatMap((column) => column.links),
  ];

  return buildLandingPages(home, websitePackages, websiteDestinations, adminPackages, adminDestinations, staticRoutes);
}

export async function fetchContentPerformance() {
  const [home, packages, destinations] = await Promise.all([
    fetchWebsiteHome(),
    fetchAllPackages(),
    fetchAllDestinations(),
  ]);

  const recentlyUpdatedPackages = [...packages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const recentlyUpdatedDestinations = [...destinations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return {
    featuredPackages: home.featuredPackages,
    featuredDestinations: home.featuredDestinations,
    latestPackages: home.latestPackages,
    popularDestinations: home.popularDestinations,
    recentlyUpdatedPackages,
    recentlyUpdatedDestinations,
    popularPagesAvailable: false,
  };
}
