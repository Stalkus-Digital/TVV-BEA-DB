import type { NavigationCountryNode } from "@/lib/hierarchy/types";
import { apiClient } from "./client";
import { endpoints } from "./config";
import { siteApiUrl } from "./site-origin";

/** Raw destination row this frontend expects — mapped from Travel OS's real Website API. */
export interface ApiDestinationRow {
  slug: string;
  name: string;
  region?: string;
  shortDescription?: string | null;
  heroImage?: string | null;
  featured?: boolean;
  startsFrom?: number;
  continent?: string;
  countryCode?: string;
}

/**
 * Travel OS's real destination DTOs — see docs/29_API_MAPPING.md in the
 * backend repo. Much sparser than `ApiDestinationRow`: no region,
 * shortDescription, startsFrom, continent, or countryCode exist on either
 * DTO. Every one of those fields is optional here, so they're simply left
 * `undefined`, not fabricated.
 */
interface WebsiteDestinationSummaryDTO {
  slug: string;
  name: string;
  heroImage: string | null;
}

function toDestinationRow(dto: WebsiteDestinationSummaryDTO): ApiDestinationRow {
  return { slug: dto.slug, name: dto.name, heroImage: dto.heroImage };
}

export async function fetchDestinations(): Promise<ApiDestinationRow[]> {
  const body = await apiClient.get<{ items: WebsiteDestinationSummaryDTO[] }>(endpoints.destinations.list, {
    noAuth: true,
  });
  return (body?.items ?? []).map(toDestinationRow);
}

export async function fetchDestinationBySlug(slug: string): Promise<ApiDestinationRow | null> {
  const body = await apiClient.get<WebsiteDestinationSummaryDTO>(endpoints.destinations.detail(slug), {
    treat404AsNull: true,
    noAuth: true,
  });
  return body ? toDestinationRow(body) : null;
}

/** Featured destinations from `/api/website/home` — used by homepage shelf. */
export async function fetchFeaturedDestinations(): Promise<ApiDestinationRow[]> {
  const body = await apiClient.get<{ featuredDestinations: WebsiteDestinationSummaryDTO[] }>(
    endpoints.homepage.home,
    { noAuth: true },
  );
  return (body?.featuredDestinations ?? []).map(toDestinationRow);
}

/** Public Postgres hierarchy tree — served by the local Next.js route handler, entirely separate from Travel OS. Left untouched. */
export async function fetchNavigationTree(): Promise<NavigationCountryNode[]> {
  const url = siteApiUrl(endpoints.navigation.tree);
  const tree = await apiClient.get<NavigationCountryNode[]>(url, { noAuth: true });
  return tree ?? [];
}
