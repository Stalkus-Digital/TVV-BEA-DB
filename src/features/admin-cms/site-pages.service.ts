import { prisma } from "@/shared/database/prisma-client";
import {
  SITE_PAGES_REGISTRY,
  uniqueContentSlugs,
  type SitePageKind,
} from "./site-pages-registry";
import { SITE_PAGE_SEEDS } from "./site-page-seeds";

export interface SitePageListItem {
  registryId: string;
  label: string;
  kind: SitePageKind;
  publicPath: string;
  description: string;
  slug: string | null;
  manageHref: string | null;
  /** Present when a CmsPage row exists */
  id: string | null;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

/**
 * Ensure every unique content slug has a CmsPage row (create from seed if missing).
 */
export async function ensureSiteCmsPages(): Promise<void> {
  const slugs = uniqueContentSlugs();
  const existing = await prisma.cmsPage.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  const have = new Set(existing.map((p) => p.slug));

  for (const slug of slugs) {
    if (have.has(slug)) continue;
    const seed = SITE_PAGE_SEEDS[slug];
    if (!seed) {
      await prisma.cmsPage.create({
        data: {
          slug,
          title: slug,
          status: "DRAFT",
          content: {},
        },
      });
      continue;
    }
    await prisma.cmsPage.create({
      data: {
        slug,
        title: seed.title,
        status: seed.status,
        content: seed.content,
      },
    });
  }
}

/**
 * Merge registry with DB CmsPage rows for the admin Pages list.
 */
export async function listSitePages(): Promise<SitePageListItem[]> {
  await ensureSiteCmsPages();

  const slugs = uniqueContentSlugs();
  const pages = await prisma.cmsPage.findMany({
    where: { slug: { in: slugs } },
  });
  const bySlug = new Map(pages.map((p) => [p.slug, p]));

  // Also include any custom CmsPages not in the registry (created via + Create Page)
  const custom = await prisma.cmsPage.findMany({
    where: { slug: { notIn: slugs } },
    orderBy: { createdAt: "desc" },
  });

  const registryItems: SitePageListItem[] = SITE_PAGES_REGISTRY.map((entry) => {
    const page = entry.slug ? bySlug.get(entry.slug) : undefined;
    return {
      registryId: entry.id,
      label: entry.label,
      kind: entry.kind,
      publicPath: entry.publicPath,
      description: entry.description,
      slug: entry.slug ?? null,
      manageHref: entry.manageHref ?? null,
      id: page?.id ?? null,
      title: page?.title ?? null,
      status: page?.status ?? (entry.kind === "catalog" ? "CATALOG" : null),
      updatedAt: page?.updatedAt?.toISOString() ?? null,
      createdAt: page?.createdAt?.toISOString() ?? null,
    };
  });

  const customItems: SitePageListItem[] = custom.map((page) => ({
    registryId: `custom-${page.id}`,
    label: page.title,
    kind: "content" as const,
    publicPath: `/p/${page.slug}`,
    description: "Custom CMS page",
    slug: page.slug,
    manageHref: null,
    id: page.id,
    title: page.title,
    status: page.status,
    updatedAt: page.updatedAt.toISOString(),
    createdAt: page.createdAt.toISOString(),
  }));

  return [...registryItems, ...customItems];
}
