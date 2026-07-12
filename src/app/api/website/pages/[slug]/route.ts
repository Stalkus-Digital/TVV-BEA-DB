import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const slug = params.slug;

  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug }
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (page.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Page not available" }, { status: 404 });
    }

    // Format matches CmsPagePayload in frontend
    return NextResponse.json({
      page: {
        slug: page.slug,
        heroTitle: page.title,
        content: page.content
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
