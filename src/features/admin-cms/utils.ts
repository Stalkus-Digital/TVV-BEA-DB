import type { Destination } from "@/features/admin-destinations/types";
import type { Package } from "@/features/admin-packages/types";
import type { CmsDashboardStats, FaqListItem, HomepageResponse, NavigationResponse, SeoListItem } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function flattenFaqs(destinations: Destination[], packages: Package[]): FaqListItem[] {
  const destinationFaqs = destinations.flatMap((destination) =>
    (destination.faqs || []).map((faq) => ({
      ...faq,
      parentType: "destination" as const,
      parentId: destination.id,
      parentName: destination.name,
      parentSlug: destination.slug,
    }))
  );

  const packageFaqs = packages.flatMap((pkg) =>
    (pkg.faqs || []).map((faq) => ({
      ...faq,
      parentType: "package" as const,
      parentId: pkg.id,
      parentName: pkg.title,
      parentSlug: pkg.slug,
    }))
  );

  return [...destinationFaqs, ...packageFaqs].sort((a, b) => a.parentName.localeCompare(b.parentName));
}

export function buildSeoList(destinations: Destination[], packages: Package[]): SeoListItem[] {
  const destinationItems: SeoListItem[] = destinations.map((destination) => ({
    id: destination.id,
    type: "destination",
    name: destination.name,
    slug: destination.slug,
    seo: destination.seo,
    updatedAt: destination.updatedAt,
  }));

  const packageItems: SeoListItem[] = packages.map((pkg) => ({
    id: pkg.id,
    type: "package",
    name: pkg.title,
    slug: pkg.slug,
    seo: pkg.seo,
    updatedAt: pkg.updatedAt,
  }));

  return [...destinationItems, ...packageItems].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildDashboardStats(
  homepage: HomepageResponse | undefined,
  navigation: NavigationResponse | undefined,
  destinations: Destination[],
  packages: Package[]
): CmsDashboardStats {
  const destinationFaqCount = destinations.reduce((sum, item) => sum + (item.faqs?.length || 0), 0);
  const packageFaqCount = packages.reduce((sum, item) => sum + (item.faqs?.length || 0), 0);
  const footerLinkCount =
    navigation?.footer?.columns?.reduce((sum, column) => sum + (column.links?.length || 0), 0) ?? 0;

  return {
    featuredDestinationCount: homepage?.featuredDestinations.length ?? destinations.filter((d) => d.isFeatured).length,
    publishedPackageCount: homepage?.featuredPackages.length ?? packages.filter((p) => p.status === "PUBLISHED").length,
    destinationFaqCount,
    packageFaqCount,
    heroConfigured: Boolean(
      homepage?.sections?.some((s) => s.type === "hero" && s.enabled) ||
        homepage?.heroBanner?.headline
    ),
    menuItemCount: navigation?.menu.length ?? 0,
    footerLinkCount,
  };
}

export function hasSeoContent(seo: { metaTitle?: string; metaDescription?: string; focusKeyword?: string } | null | undefined): boolean {
  return Boolean(seo?.metaTitle || seo?.metaDescription || seo?.focusKeyword);
}
