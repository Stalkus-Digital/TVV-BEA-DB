/**
 * Packages service — Travel OS website API in live mode; `lib/mock` when
 * `NEXT_PUBLIC_USE_MOCK=true`.
 *
 * Consumers (pages, sections) call this and receive `Package`. They never
 * see raw DTO shapes. The service handles mock vs live switching and
 * deterministic ordering for SEO-stable rendering.
 */

import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import {
  fetchFeaturedPackages,
  fetchPackageBySlug,
  fetchPackages,
  fetchRelatedPackages,
} from "@/lib/api/packages";
import { ApiError } from "@/lib/api/errors";
import type { Package, Region } from "@/lib/models";
import { manualPackages } from "@/lib/mock";
import { imageOrFallback } from "@/lib/adapters/publicApi";
import { fromManualList } from "@/lib/adapters";

export interface PackageQuery {
  region?: Region;
  destination?: string;
  theme?: string;
  source?: "manual";
  limit?: number;
  /** Sort key; default = by rating desc. */
  sort?: "relevant" | "price-asc" | "price-desc" | "rating" | "duration-asc";
}

function allUnified(): Package[] {
  return fromManualList(manualPackages);
}

function normalizePackageHero(pkg: Package): Package {
  const image = pkg.hero?.image?.trim();
  if (image) return pkg;
  return {
    ...pkg,
    hero: { ...pkg.hero, image: imageOrFallback(null), alt: pkg.hero?.alt ?? pkg.title },
  };
}

function applyQuery(list: Package[], q: PackageQuery): Package[] {
  let out = list;
  if (q.source) out = out.filter((p) => p.vendor.source === q.source);
  if (q.region) out = out.filter((p) => p.region === q.region);
  if (q.destination) {
    const needle = q.destination.toLowerCase();
    out = out.filter((p) => p.destination.toLowerCase().includes(needle));
  }
  if (q.theme && q.theme !== "all") {
    out = out.filter((p) => (p.themes ?? []).includes(q.theme!.toLowerCase()));
  }
  const sorted = [...out];
  switch (q.sort) {
    case "price-asc": sorted.sort((a, b) => a.pricing.perAdult - b.pricing.perAdult); break;
    case "price-desc": sorted.sort((a, b) => b.pricing.perAdult - a.pricing.perAdult); break;
    case "rating": sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    case "duration-asc": sorted.sort((a, b) => a.durationDays - b.durationDays); break;
    default:
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return q.limit ? sorted.slice(0, q.limit) : sorted;
}

export const packagesService = {
  /** Full list (filtered/sorted/limited). */
  async list(q: PackageQuery = {}): Promise<ServiceResult<Package[]>> {
    if (apiConfig.useMock) return ok(applyQuery(allUnified(), q), "mock");
    try {
      const rows = (await fetchPackages(q as Record<string, string>)).map(normalizePackageHero);
      return ok(applyQuery(rows, q), "live");
    } catch (err) {
      return fail<Package[]>(ApiError.fromUnknown(err), "live");
    }
  },

  /**
   * Server-filtered list.
   *
   * Used by the `/packages/*` filter UI to query the backend with shareable
   * URL params (region, tripType, durationTag, plus any existing params).
   */
  async listRemote(params: Record<string, string> = {}): Promise<ServiceResult<Package[]>> {
    if (apiConfig.useMock) return ok(applyQuery(allUnified(), {}), "mock");
    try {
      const rows = (await fetchPackages(params)).map(normalizePackageHero);
      return ok(rows, "live");
    } catch (err) {
      return fail<Package[]>(ApiError.fromUnknown(err), "live");
    }
  },

  /** Single package by frontend slug. */
  async getBySlug(slug: string): Promise<ServiceResult<Package | null>> {
    if (apiConfig.useMock) {
      const found = allUnified().find((p) => p.slug === slug) ?? null;
      return ok(found, "mock");
    }
    try {
      const pkg = await fetchPackageBySlug(slug);
      return ok(pkg ? normalizePackageHero(pkg) : null, "live");
    } catch (err) {
      return fail<Package | null>(ApiError.fromUnknown(err), "live");
    }
  },

  /** Related packages — embedded on Travel OS package detail in live mode. */
  async getRelated(slug: string, limit = 6): Promise<ServiceResult<Package[]>> {
    if (apiConfig.useMock) {
      const all = allUnified();
      const me = all.find((p) => p.slug === slug);
      if (!me) return ok([], "mock");
      const related = all.filter((p) =>
        p.slug !== me.slug && (
          p.region === me.region || (me.themes ?? []).some((t) => p.themes?.includes(t))
        ),
      );
      return ok(related.slice(0, limit), "mock");
    }
    try {
      const rows = await fetchRelatedPackages(slug, limit);
      return ok(rows.slice(0, limit), "live");
    } catch (err) {
      return fail<Package[]>(ApiError.fromUnknown(err), "live");
    }
  },

  /** Convenience: by region (kept for SEO-friendly silo pages). */
  byRegion(region: Region, limit?: number) {
    return this.list({ region, limit });
  },

  /** Convenience: by theme (honeymoon, luxury, etc.). */
  byTheme(theme: string, limit?: number) {
    return this.list({ theme, limit });
  },

  /** Featured shelf — uses `/api/website/home` in live mode. */
  async featured(limit = 8): Promise<ServiceResult<Package[]>> {
    if (apiConfig.useMock) return ok(applyQuery(allUnified(), { sort: "relevant", limit }), "mock");
    try {
      const rows = (await fetchFeaturedPackages(limit)).map(normalizePackageHero);
      return ok(rows, "live");
    } catch (err) {
      return fail<Package[]>(ApiError.fromUnknown(err), "live");
    }
  },
};

export type PackagesService = typeof packagesService;
