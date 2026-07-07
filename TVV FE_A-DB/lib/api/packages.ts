import { apiClient } from "./client";
import { endpoints } from "./config";
import { ApiError } from "./errors";
import type { Package } from "@/lib/models";

export interface PackageListParams {
  region?: string;
  destination?: string;
  theme?: string;
  tripType?: string;
  durationTag?: string;
  source?: string;
  limit?: string;
  sort?: string;
  page?: string;
}

/** Travel OS's real Website API package shapes — see docs/29_API_MAPPING.md in the backend repo. */
export interface WebsitePackageSummaryDTO {
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

interface WebsitePackageDetailDTO extends WebsitePackageSummaryDTO {
  itinerary: { dayNumber: number; title: string; description: string | null }[];
  pricing: { currency: string; basePrice: number; fromPrice: number | null } | null;
  gallery: string[];
  relatedPackages: WebsitePackageSummaryDTO[];
  seo: { title: string; description: string; canonicalUrl: string; ogImage: string | null };
}

interface HomepageResponseDTO {
  featuredPackages: WebsitePackageSummaryDTO[];
}

/**
 * `WebsitePackageSummaryDTO` → the frontend's own `Package` model. Travel OS
 * has no `region`/`vendor`/`rating`/`badges`/`themes`/`inclusions`/
 * `exclusions`/`policy` fields on any package DTO — every one of those is
 * optional on `Package`, so they're simply omitted, not fabricated.
 * `region` is the one exception: it's REQUIRED on `Package`, and Travel OS
 * has no region/country-code concept at all — `"domestic"` is a documented
 * placeholder, not an inference. See docs/26_FRONTEND_BACKEND_MAPPING.md.
 */
export function toPackage(dto: WebsitePackageSummaryDTO): Package {
  return {
    slug: dto.slug,
    vendor: { source: "manual", vendorName: "travel-os" },
    title: dto.title,
    destination: dto.destinationName,
    region: "domestic",
    durationDays: dto.durationDays,
    durationNights: dto.durationNights,
    pricing: {
      currency: (dto.currency ?? "INR") as Package["pricing"]["currency"],
      perAdult: dto.fromPrice ?? 0,
      pricingModel: "per-adult",
    },
    hero: { image: dto.heroImage ?? "" },
    destinations: [{ days: dto.durationDays, city: dto.destinationName }],
  };
}

function toPackageDetail(dto: WebsitePackageDetailDTO): Package {
  const base = toPackage(dto);
  return {
    ...base,
    pricing: dto.pricing
      ? { currency: dto.pricing.currency as Package["pricing"]["currency"], perAdult: dto.pricing.fromPrice ?? dto.pricing.basePrice, pricingModel: "per-adult" }
      : base.pricing,
    hero: { image: dto.heroImage ?? "", gallery: dto.gallery.map((url) => ({ url })) },
    itinerary: dto.itinerary.map((day) => ({
      day: day.dayNumber,
      title: day.title,
      city: dto.destinationName,
      description: day.description ?? "",
    })),
    seo: { title: dto.seo.title, description: dto.seo.description, canonical: dto.seo.canonicalUrl, ogImage: dto.seo.ogImage ?? undefined },
  };
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === "all") continue;
    qs.set(key, trimmed);
  }
  const query = qs.toString();
  return query ? `?${query}` : "";
}

/**
 * Only `destination` (mapped to Travel OS's `destinationSlug`) and `page`
 * are honored — `region`/`theme`/`tripType`/`durationTag`/`source`/`sort`
 * have no equivalent filter on `/api/website/packages` (see
 * docs/27_INTEGRATION_STRATEGY.md's Performance Opportunities section).
 */
export async function fetchPackages(params: PackageListParams = {}): Promise<Package[]> {
  const query = buildQueryString({
    destinationSlug: params.destination,
    page: params.page,
    pageSize: params.limit,
  });
  const body = await apiClient.get<{ items: WebsitePackageSummaryDTO[] }>(`${endpoints.packages.list}${query}`, {
    noAuth: true,
  });
  return (body?.items ?? []).map(toPackage);
}

export async function fetchPackageBySlug(slug: string): Promise<Package | null> {
  const body = await apiClient.get<WebsitePackageDetailDTO>(endpoints.packages.detail(slug), {
    treat404AsNull: true,
    noAuth: true,
  });
  return body ? toPackageDetail(body) : null;
}

/** No dedicated "featured" endpoint exists — sourced from `/api/website/home`'s `featuredPackages`. */
export async function fetchFeaturedPackages(limit = 8): Promise<Package[]> {
  const body = await apiClient.get<HomepageResponseDTO>(endpoints.homepage.home, { noAuth: true });
  return (body?.featuredPackages ?? []).slice(0, limit).map(toPackage);
}

/** No dedicated "related" endpoint exists — `relatedPackages` is embedded in the package detail response. */
export async function fetchRelatedPackages(slug: string, limit = 6): Promise<Package[]> {
  const body = await apiClient.get<WebsitePackageDetailDTO>(endpoints.packages.detail(slug), {
    treat404AsNull: true,
    noAuth: true,
  });
  return (body?.relatedPackages ?? []).slice(0, limit).map(toPackage);
}

/** No public TripJack vendor read API on Travel OS. */
export async function fetchTripJackPackages(): Promise<never> {
  throw ApiError.notImplemented("TripJack packages");
}

export async function fetchTripJackPackageById(_id: string): Promise<never> {
  throw ApiError.notImplemented("TripJack package detail");
}
