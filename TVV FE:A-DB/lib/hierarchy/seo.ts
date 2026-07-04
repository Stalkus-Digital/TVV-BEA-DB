/**
 * Centralised SEO metadata builder.
 *
 *  Every page that renders a hierarchy entity (catch-all, hotel page,
 *  package page, guide page) calls `buildSeoMetadata()` instead of
 *  rolling its own title/description/canonical/og logic. This is what
 *  keeps the entire site's SEO consistent — change a default here and
 *  every page picks it up.
 *
 *  WHAT IT RETURNS
 *  ---------------
 *   • title, description    — from entity meta fields with sensible fallbacks
 *   • canonical             — built from the entity's path, locale-prefixed if needed
 *   • OpenGraph             — site name, locale, image
 *   • Twitter cards         — summary_large_image
 *   • robots                — index/follow unless draft
 *   • alternates.languages  — empty today, hreflang plugs in here later
 *
 *  PAIRED WITH JSON-LD
 *  -------------------
 *  Pages render `<JsonLd data={buildBreadcrumbJsonLd(crumbs)} />` to emit
 *  schema.org Breadcrumbs alongside the metadata. Search engines pick
 *  this up automatically and improve the SERP snippet.
 *
 *  WHAT IT DOES NOT DO
 *  -------------------
 *  Does NOT do per-locale URL translation — that's the next layer,
 *  driven by DestinationTranslation rows. Today it just emits canonical
 *  for the default locale.
 */

import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

export interface SeoInput {
  title?: string | null;
  description?: string | null;
  /** Canonical path WITHOUT origin. e.g. "/india/andaman/honeymoon-packages" */
  canonicalPath: string;
  /** Open Graph hero image. */
  imageUrl?: string | null;
  /** "article" for guides, "website" for landings, "product" for packages. */
  ogType?: "website" | "article" | "product";
  /** Default true. Set false for draft / 404 / not-public pages. */
  indexable?: boolean;
  /** ISO locale, defaults to "en_IN". */
  locale?: string;
  /** Map of locale → canonical path. Populates `alternates.languages`. */
  hreflang?: Record<string, string>;
}

const DEFAULT_LOCALE = "en_IN";

export function buildSeoMetadata(input: SeoInput): Metadata {
  const title = input.title?.trim() || SITE.name;
  const description = input.description?.trim() || SITE.description;
  const canonicalAbs = `${SITE.url}${input.canonicalPath}`;
  const indexable = input.indexable ?? true;
  const locale = input.locale ?? DEFAULT_LOCALE;
  // Next.js Metadata openGraph.type does not include "product".
  const openGraphType: "website" | "article" =
    input.ogType === "article" ? "article" : "website";

  return {
    title,
    description,
    alternates: {
      canonical: input.canonicalPath,
      languages: input.hreflang ?? undefined,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonicalAbs,
      siteName: SITE.name,
      locale,
      type: openGraphType,
      images: input.imageUrl ? [{ url: input.imageUrl }] : undefined,
    },
    twitter: {
      card: input.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: input.imageUrl ? [input.imageUrl] : undefined,
      site: SITE.twitter ?? undefined,
    },
  };
}

/**
 * Build a schema.org BreadcrumbList JSON-LD object for the page header.
 * Pair with the existing `<JsonLd>` component in components/ui.
 */
export function buildBreadcrumbJsonLd(
  crumbs: { label: string; href: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href.startsWith("http") ? c.href : `${SITE.url}${c.href}`,
    })),
  };
}

/**
 * Build TouristDestination JSON-LD for a destination landing page.
 * Schema.org TouristDestination is the canonical type for places-to-visit.
 */
export function buildDestinationJsonLd(input: {
  name: string;
  description: string | null;
  url: string;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url.startsWith("http") ? input.url : `${SITE.url}${input.url}`,
    image: input.imageUrl ?? undefined,
  };
}

/**
 * Article JSON-LD for guides. Powers the "article" rich result in Google.
 */
export function buildArticleJsonLd(input: {
  title: string;
  description: string | null;
  url: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description ?? undefined,
    url: input.url.startsWith("http") ? input.url : `${SITE.url}${input.url}`,
    image: input.imageUrl ?? undefined,
    datePublished: input.publishedAt ?? undefined,
    author: { "@type": "Organization", name: input.authorName ?? SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };
}
