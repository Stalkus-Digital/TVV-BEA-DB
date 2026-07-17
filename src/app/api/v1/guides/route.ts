import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { mapCmsGuideToPublic } from "@/lib/cms/map-cms-guide";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20)) : undefined;
    const category = searchParams.get("category")?.trim();
    const tag = searchParams.get("tag")?.trim()?.toLowerCase();

    const guides = await prisma.cmsGuide.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
    });

    let items = guides.map((g) => mapCmsGuideToPublic(g, { includeBody: false }));

    if (category) {
      const needle = category.toLowerCase();
      items = items.filter((g) => g.category.toLowerCase() === needle);
    }
    if (tag) {
      items = items.filter((g) => g.tags.some((t) => t.toLowerCase() === tag));
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch guides";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
