import { apiClient } from "./client";
import { endpoints } from "./config";
import { ApiError } from "./errors";
import { pickField } from "./envelope";

export interface SiteSettingsPayload {
  name?: string;
  shortName?: string;
  url?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string | null;
  ogImage?: string | null;
  twitter?: string | null;
  phone?: string;
  whatsapp?: string;
  email?: string;
  bookingEmail?: string | null;
  address?: { line1?: string | null; line2?: string | null; short?: string | null } | null;
  hours?: { weekdays?: string | null; sunday?: string | null; short?: string | null } | null;
  socialLinks?: { platform: string; url: string; label?: string | null }[];
  footerTagline?: string | null;
  footerCopyright?: string | null;
}

export interface HomepageConfig {
  hero?: Record<string, unknown>;
  sections?: Record<string, unknown>[];
  reels?: unknown[];
  featured?: unknown[];
}

export interface CmsPagePayload {
  page: {
    slug: string;
    heroEyebrow?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImage?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoOgImage?: string | null;
  };
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

/** No standalone site-settings endpoint — use `/api/website/home` in Phase 5. */
export async function fetchSiteSettings(): Promise<SiteSettingsPayload | null> {
  throw ApiError.notImplemented("Site settings");
}

export async function fetchHomepageConfig(): Promise<HomepageConfig | null> {
  const body = await apiClient.get<unknown>(endpoints.homepage.home, { noAuth: true, treat404AsNull: true });
  if (!body) return null;
  const nested = pickField<HomepageConfig>(body, "homepage");
  if (nested) return nested;
  return body as HomepageConfig;
}

/** No CMS pages endpoint on Travel OS website API yet. */
export async function fetchPageBySlug(_slug: string): Promise<CmsPagePayload | null> {
  throw ApiError.notImplemented("CMS pages");
}
