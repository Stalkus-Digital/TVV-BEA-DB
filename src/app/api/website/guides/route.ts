import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { mapCmsGuideToPublic } from "@/lib/cms/map-cms-guide";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));
    const limitRaw = searchParams.get("limit");
    const take = limitRaw
      ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20))
      : pageSize;
    const skip = limitRaw ? 0 : (page - 1) * pageSize;

    const where = { status: "PUBLISHED" as const };

    const [items, total] = await Promise.all([
      prisma.cmsGuide.findMany({
        where,
        skip,
        take,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.cmsGuide.count({ where }),
    ]);

    const formattedItems = items.map((item) => mapCmsGuideToPublic(item, { includeBody: false }));

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        page: limitRaw ? 1 : page,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch guides";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
