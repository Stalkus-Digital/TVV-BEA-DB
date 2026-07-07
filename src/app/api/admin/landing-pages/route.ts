import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const pages = await prisma.landingPage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch landing pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ensure slug is unique or generate a default one
    let slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await prisma.landingPage.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = await prisma.landingPage.create({
      data: {
        title: body.title,
        slug,
        heroSection: body.heroSection || {},
        packages: body.packages || [],
        faqSection: body.faqSection || [],
      },
    });
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create landing page" }, { status: 500 });
  }
}
