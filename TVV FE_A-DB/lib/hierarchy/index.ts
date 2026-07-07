/**
 * Public barrel for the hierarchy package.
 *
 *  Any consumer (API routes, server components, admin UI) should import
 *  from here, never from the internal files directly. This is the contract
 *  the rest of the codebase depends on; reorganising internals is free as
 *  long as this surface holds.
 */

export { hierarchyDb } from "./db";

// ─── Geographic resolvers + tree (REGION → COUNTRY → DESTINATION → SUB) ────
export { resolveDestination } from "./resolve";
export {
  getDestinationTree,
  getAllPublishedDestinations,
  DESTINATION_TREE_TAG,
} from "./tree";
export { buildBreadcrumbs } from "./breadcrumbs";

// ─── Public URL surface (`/[country]/[destination]/[category]`) ────────────
export { resolveHierarchyUrl } from "./resolve-public";
export type { HierarchyResolution } from "./resolve-public";
export { buildPublicBreadcrumbs } from "./breadcrumbs-public";
export { getNavigationTree } from "./navigation-tree";
export {
  buildCountryPath,
  buildDestinationPath,
  buildCategoryPath,
  buildHierarchyPath,
} from "./seo-path";

// ─── Categories ────────────────────────────────────────────────────────────
export {
  listCategoriesForDestination,
  resolveCategory,
  collectAllPublishedCategories,
  CATEGORIES_TAG,
} from "./categories";

// ─── Content domains: hotels, packages, guides, ferries, flights ──────────
export {
  listHotelsForDestination,
  resolveHotelBySlug,
  listPackagesForDestination,
  listPackagesForCategory,
  resolvePackageBySlug,
  listGuidesForDestination,
  resolveGuideBySlug,
  listFerryRoutesForDestination,
  listFlightRoutesForDestination,
  fetchDestinationRelatedContent,
  HOTELS_TAG,
  PACKAGES_TAG,
  GUIDES_TAG,
  FERRIES_TAG,
  FLIGHTS_TAG,
} from "./content";

// ─── Slug & validation utilities ───────────────────────────────────────────
export {
  slugify,
  isValidSlug,
  isValidSlugPathSegments,
} from "./slugify";

export {
  expectedChildLevel,
  isLegalLevelChange,
  isLegalParent,
  findSlugConflict,
} from "./validation";

export {
  RESERVED_TOP_LEVEL_SLUGS,
  isReservedTopLevelSlug,
} from "./reserved";

// ─── Slug history + redirects + SEO metadata ──────────────────────────────
export {
  recordSlugChange,
  getSlugHistoryForEntity,
  type SlugChangeInput,
} from "./slug-tracking";
export {
  lookupRedirect,
  createManualRedirect,
  listRedirects,
  deleteRedirect,
  bustRedirectCache,
  REDIRECTS_TAG,
  type RedirectHit,
  type CreateRedirectInput,
} from "./redirects";
export {
  buildSeoMetadata,
  buildBreadcrumbJsonLd,
  buildDestinationJsonLd,
  buildArticleJsonLd,
  type SeoInput,
} from "./seo";

// ─── Types ─────────────────────────────────────────────────────────────────
export type {
  DestinationNode,
  DestinationTreeNode,
  DestinationDetail,
  DestinationLevel,
  DestinationStatus,
  BreadcrumbItem,
  DestinationCategoryNode,
  DestinationCategoryDetail,
  NavigationCountryNode,
  NavigationDestinationNode,
  NavigationCategoryNode,
  HotelNode,
  HotelDetail,
  PackageNode,
  PackageDetail,
  PackageDestinationLink,
  PackageHotelLink,
  PackageCategoryLink,
  GuideNode,
  GuideDetail,
  FerryRouteNode,
  FlightRouteNode,
} from "./types";
