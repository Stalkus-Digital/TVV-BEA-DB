import { NextResponse } from "next/server";
import { jsonSuccess, jsonError } from "@/api/http";
import { listSitePages } from "@/features/admin-cms/site-pages.service";
import { createCmsPage } from "@/features/admin-cms/services/cms-content.service";

/**
 * GET — merged site-page registry + CmsPage rows (ensures content pages exist).
 * POST — create a custom CmsPage via the shared cms-content.service (validates
 *        slug uniqueness and required fields in one place).
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

    const newPage = await createCmsPage({
      title,
      slug,
      content: content && typeof content === "object" ? content : {},
      status: status || "DRAFT",
    });

    return jsonSuccess(newPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create static page";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
