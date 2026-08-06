import { NextResponse } from "next/server";
import { jsonSuccess, jsonError } from "@/api/http";
import { createCmsGuide } from "@/features/admin-cms/services/cms-content.service";

/**
 * GET  — list all guides ordered by newest first.
 * POST — create a guide via the shared cms-content.service
 *        (validates slug uniqueness and required fields).
 */
export async function GET() {
  try {
    const { prisma } = await import("@/shared/database/prisma-client");
    const guides = await prisma.cmsGuide.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonSuccess({ items: guides });
  } catch {
    return jsonError(new Error("Failed to fetch guides"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, authorId, status } = body;

    const newGuide = await createCmsGuide({
      title,
      slug,
      content: content || [],
      authorId: authorId ?? null,
      status: status || "DRAFT",
    });

    return jsonSuccess(newGuide);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create guide";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
