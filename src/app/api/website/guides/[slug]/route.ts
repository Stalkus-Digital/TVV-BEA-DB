import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const guide = await prisma.cmsGuide.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        authorId: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!guide || guide.status !== "PUBLISHED") {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 });
    }

    const content = guide.content as any;
    const formattedGuide = {
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      body: content?.body || "",
      excerpt: content?.excerpt || "",
      coverImage: content?.coverImage || "",
      seo: {
        metaTitle: content?.metaTitle || guide.title,
        metaDescription: content?.metaDescription || content?.excerpt || "",
      },
      publishedAt: guide.publishedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedGuide,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
