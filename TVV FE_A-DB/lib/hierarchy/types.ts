/**
 * Public-facing TypeScript shapes for the hierarchy.
 *
 *  The Prisma-generated types live inside `./generated/index.d.ts` and are
 *  the source of truth for DB rows. This file re-exports trimmed-down,
 *  serialisable subsets — what we send across the API boundary and to
 *  React Server Components.
 *
 *  Why not just expose the Prisma row directly?
 *   • `BigInt` is not JSON-serialisable; we convert to string at the edge.
 *   • Some columns are CMS-internal (`seo_content`, `gallery`) and should
 *     not appear in the mega-menu payload.
 *   • Decoupling the API from the storage shape lets us refactor the schema
 *     without breaking every consumer.
 */

import type { DestinationLevel, DestinationStatus } from "./generated";

export type { DestinationLevel, DestinationStatus };

/**
 * Minimal node — what the mega menu, sitemap, and breadcrumb renderer need.
 * Tree responses paginate by depth, not by count, so this stays small.
 */
export interface DestinationNode {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  slugPath: string;
  level: DestinationLevel;
  depth: number;
  imageUrl: string | null;
  sortOrder: number;
}

/** A node plus its expanded children — what `/api/v2/destinations/tree` returns. */
export interface DestinationTreeNode extends DestinationNode {
  children: DestinationTreeNode[];
}

/**
 * Rich detail — what `/destinations/<path>/page.tsx` consumes. Carries the
 * editorial fields the public detail page actually renders.
 */
export interface DestinationDetail extends DestinationNode {
  metaTitle: string | null;
  metaDescription: string | null;
  seoContent: string | null;
  heroImageUrl: string | null;
  gallery: string[];
  status: DestinationStatus;
  isFeatured: boolean;
  publishedAt: string | null;
}

/** Breadcrumb item — what `/destinations/<path>` renders at the top. */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Minimal category node — what the mega menu and category index pages
 * render. Mirrors `DestinationNode` in spirit: small, JSON-safe, no
 * editorial body.
 */
export interface DestinationCategoryNode {
  id: string;
  destinationId: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  sortOrder: number;
  isFeatured: boolean;
}

/** Full category row — what the category landing page renders. */
export interface DestinationCategoryDetail extends DestinationCategoryNode {
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  seoContent: string | null;
  status: DestinationStatus;
  publishedAt: string | null;
}

/**
 * Navigation tree node — what `/api/navigation/tree` returns.
 *
 *  Country (depth 0) → Destination (depth 1) → Category (depth 2).
 *  REGION (the geographic parent of countries in the DB) is NOT exposed
 *  here — the public URL skips it and so does the menu.
 *
 *  Three nested levels = three component columns in the mega menu, in
 *  the order [country, destination, category]. Adding a fourth level
 *  later (e.g. cities under destinations) means extending this shape and
 *  the renderer; the resolver is already general over segment count.
 */
export interface NavigationCategoryNode {
  name: string;
  slug: string;
  href: string;
  isFeatured: boolean;
}
export interface NavigationDestinationNode {
  name: string;
  slug: string;
  href: string;
  isFeatured: boolean;
  imageUrl: string | null;
  children: NavigationCategoryNode[];
}
export interface NavigationCountryNode {
  name: string;
  slug: string;
  href: string;
  isFeatured: boolean;
  imageUrl: string | null;
  children: NavigationDestinationNode[];
}

// ═══════════════════════════════════════════════════════════════════════════
//   CONTENT DOMAIN SHAPES
// ═══════════════════════════════════════════════════════════════════════════
//
// One `Node` (slim, list-friendly) and one `Detail` (full editorial body
// + eager-loaded relations) per domain. Mirrors the Destination /
// DestinationCategory naming so consumers can grep predictably.

// ─── Hotel ─────────────────────────────────────────────────────────────────
export interface HotelNode {
  id: string;
  destinationId: string;
  name: string;
  slug: string;
  starRating: number | null;
  shortDescription: string | null;
  heroImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
}
export interface HotelDetail extends HotelNode {
  gallery: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  seoContent: string | null;
  status: DestinationStatus;
  publishedAt: string | null;
  destination: DestinationNode;
}

// ─── Package ───────────────────────────────────────────────────────────────
export interface PackageNode {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  durationDays: number | null;
  durationNights: number | null;
  startingPrice: number | null;
  currency: string;
  heroImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
}
export interface PackageDestinationLink {
  isPrimary: boolean;
  sortOrder: number;
  nights: number | null;
  destination: DestinationNode;
}
export interface PackageHotelLink {
  nights: number | null;
  sortOrder: number;
  hotel: HotelNode;
}
export interface PackageCategoryLink {
  sortOrder: number;
  category: DestinationCategoryNode;
}
export interface PackageDetail extends PackageNode {
  gallery: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  seoContent: string | null;
  status: DestinationStatus;
  publishedAt: string | null;
  destinations: PackageDestinationLink[];
  hotels: PackageHotelLink[];
  categories: PackageCategoryLink[];
}

// ─── Guide ─────────────────────────────────────────────────────────────────
export interface GuideNode {
  id: string;
  destinationId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  readingMinutes: number | null;
  heroImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
}
export interface GuideDetail extends GuideNode {
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: DestinationStatus;
  publishedAt: string | null;
  destination: DestinationNode;
}

// ─── Ferry / Flight routes ────────────────────────────────────────────────
export interface FerryRouteNode {
  id: string;
  destinationId: string;
  name: string;
  slug: string;
  originName: string;
  destinationName: string;
  operatorName: string | null;
  durationMinutes: number | null;
  startingPrice: number | null;
  currency: string;
  isFeatured: boolean;
  sortOrder: number;
}
export interface FlightRouteNode {
  id: string;
  destinationId: string;
  name: string;
  slug: string;
  originIATA: string;
  destIATA: string;
  originCity: string;
  destCity: string;
  approxDurationMinutes: number | null;
  startingPrice: number | null;
  currency: string;
  isFeatured: boolean;
  sortOrder: number;
}
