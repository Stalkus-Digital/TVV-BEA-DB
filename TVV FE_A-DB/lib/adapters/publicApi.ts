/**
 * Map monolith /api/v1 JSON rows → frontend domain models.
 */

import type { Destination, Experience, Guide, Region } from "@/lib/models";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

export function resolveImageSrc(src?: string | null): string | null {
  const trimmed = src?.trim();
  return trimmed ? trimmed : null;
}

export function imageOrFallback(src?: string | null): string {
  return resolveImageSrc(src) ?? FALLBACK_IMAGE;
}

interface ApiDestinationRow {
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

export function fromApiDestination(row: ApiDestinationRow): Destination {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.shortDescription?.trim() || row.name,
    description: row.shortDescription ?? undefined,
    region: (row.region ?? "domestic") as Region,
    continent: row.continent,
    countryCode: row.countryCode,
    startsFrom: row.startsFrom ?? 0,
    image: imageOrFallback(row.heroImage),
    heroImage: resolveImageSrc(row.heroImage) ?? undefined,
    isAuthorityHub: row.featured === true || row.slug === "andaman",
  };
}

interface ApiExperienceRow {
  slug: string;
  name: string;
  description?: string | null;
  tag?: string | null;
  heroImage?: string | null;
}

export function fromApiExperience(row: ApiExperienceRow): Experience {
  return {
    slug: row.slug,
    title: row.name,
    description: row.description?.trim() || "",
    icon: row.tag?.trim() || "compass",
    image: imageOrFallback(row.heroImage),
  };
}

interface ApiGuideRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags?: string[];
  readingTime?: number;
  publishedAt: string;
  updatedAt?: string;
  heroImage?: string | null;
  author: string;
}

export function fromApiGuide(row: ApiGuideRow): Guide {
  const mins = row.readingTime ?? 5;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags,
    readTime: `${mins} min read`,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    image: imageOrFallback(row.heroImage),
    author: row.author,
  };
}
