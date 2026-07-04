import type { WebsiteSeoDTO } from "../dto/website-seo.dto";

export interface SeoOverrides {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export interface SeoFallbacks {
  title: string;
  description: string;
  path: string;
}

/**
 * Pure function, no I/O — canonical URL is built from a configured base URL
 * (WebsiteConfigService) + path, never hardcoded. Falls back to entity
 * title/a generic description when no SEO override exists on the source
 * record (Package.seo / Destination.seo), so the DTO always has usable
 * values rather than empty strings.
 */
export function buildSeoDTO(baseUrl: string, overrides: SeoOverrides, fallbacks: SeoFallbacks): WebsiteSeoDTO {
  const title = overrides.metaTitle ?? fallbacks.title;
  const description = overrides.metaDescription ?? fallbacks.description;
  const canonicalUrl = overrides.canonicalUrl ?? `${baseUrl}${fallbacks.path}`;

  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: overrides.ogImageUrl ?? null,
  };
}
