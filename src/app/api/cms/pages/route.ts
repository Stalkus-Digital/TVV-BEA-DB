import { jsonSuccess, jsonError } from "@/api/http";
import { listSitePages } from "@/features/admin-cms/site-pages.service";
import { prisma } from "@/shared/database/prisma-client";
import { NextResponse } from "next/server";

/**
 * GET — merged site-page registry + CmsPage rows (ensures content pages exist).
 * POST — create a custom CmsPage (unchanged).
 */
export async function GET() {
  try {
    const items = await listSitePages();
    return jsonSuccess({ items });
  } catch (error) {
    console.error("Failed to fetch site pages", error);
    return jsonError(new Error("Failed to fetch static pages"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, status } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Title and slug are required" }, { status: 400 });
    }

    const newPage = await prisma.cmsPage.create({
      data: {
        title,
        slug,
        content: content && typeof content === "object" ? content : {},
        status: status || "DRAFT",
      },
    });

    return jsonSuccess(newPage);
  } catch (error) {
    return jsonError(new Error("Failed to create static page"));
  }
}
