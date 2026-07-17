import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { mapCmsGuideToPublic } from "@/lib/cms/map-cms-guide";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const guide = await prisma.cmsGuide.findUnique({ where: { slug } });

    if (!guide || guide.status !== "PUBLISHED") {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: mapCmsGuideToPublic(guide, { includeBody: true }),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch guide";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
