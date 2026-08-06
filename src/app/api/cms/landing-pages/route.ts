import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

function normalizeSlug(title: string, slug?: string) {
  if (slug && slug.trim()) return slug.trim();
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  try {
    const landingPages = await prisma.landingPage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonSuccess({ items: landingPages });
  } catch (error) {
    return jsonError(new Error("Failed to fetch landing pages"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, blocks, seo } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const finalSlug = normalizeSlug(title, slug);
    const existing = await prisma.landingPage.findUnique({ where: { slug: finalSlug } });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now()}` : finalSlug;

    const newLandingPage = await prisma.landingPage.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        blocks: blocks || [],
        seo: seo || {},
      },
    });

    return jsonSuccess(newLandingPage);
  } catch (error) {
    return jsonError(new Error("Failed to create landing page"));
  }
}
