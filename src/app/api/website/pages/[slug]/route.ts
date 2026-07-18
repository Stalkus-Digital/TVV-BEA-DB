import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

type PageContent = {
  body?: string;
  excerpt?: string;
  heroEyebrow?: string;
  heroSubtitle?: string;
  heroImage?: string;
  metaTitle?: string;
  metaDescription?: string;
};

function asContent(raw: unknown): PageContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as PageContent;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page || page.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const content = asContent(page.content);
    const seoTitle = content.metaTitle?.trim() || page.title;
    const seoDescription =
      content.metaDescription?.trim() || content.excerpt?.trim() || content.heroSubtitle?.trim() || "";

    return jsonSuccess({
      page: {
        slug: page.slug,
        heroEyebrow: content.heroEyebrow ?? null,
        heroTitle: page.title,
        heroSubtitle: content.heroSubtitle ?? content.excerpt ?? null,
        heroImage: content.heroImage ?? null,
        body: typeof content.body === "string" ? content.body : "",
        seoTitle,
        seoDescription,
        seoOgImage: content.heroImage ?? null,
      },
      seo: {
        title: seoTitle,
        description: seoDescription,
        ogImage: content.heroImage ?? undefined,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load page";
    return jsonError(new Error(message));
  }
}
