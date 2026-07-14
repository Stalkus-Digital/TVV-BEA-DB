import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const where = { status: "PUBLISHED" };

    const [items, total] = await Promise.all([
      prisma.cmsGuide.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          authorId: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.cmsGuide.count({ where }),
    ]);

    const formattedItems = items.map(item => {
      const content = item.content as any;
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: content?.excerpt || "",
        coverImage: content?.coverImage || "",
        publishedAt: item.publishedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
