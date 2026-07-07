/**
 * CMS page-content loader.
 *
 * Travel OS has no standalone CMS pages endpoint yet — returns null and pages
 * fall back to in-page FALLBACK_HERO constants.
 */

import { fetchPageBySlug } from "@/lib/api/website";

export interface PageContent {
  page: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
  };
  seo: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

export async function loadPageContent(slug: string): Promise<PageContent | null> {
  try {
    const data = await fetchPageBySlug(slug);
    if (!data) return null;

    const { page, seo = {} } = data;

    return {
      page: {
        heroEyebrow: page.heroEyebrow ?? undefined,
        heroTitle: page.heroTitle ?? undefined,
        heroSubtitle: page.heroSubtitle ?? undefined,
        heroImage: page.heroImage ?? undefined,
      },
      seo: {
        title: seo.title ?? page.seoTitle ?? undefined,
        description: seo.description ?? page.seoDescription ?? undefined,
        ogImage: seo.ogImage ?? page.seoOgImage ?? undefined,
      },
    };
  } catch {
    return null;
  }
}
