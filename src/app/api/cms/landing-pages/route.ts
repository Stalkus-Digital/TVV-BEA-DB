import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request) {
  try {
    const landingPages = await prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return jsonSuccess({ items: landingPages });
  } catch (error) {
    return jsonError(new Error("Failed to fetch landing pages"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, heroSection, packages, faqSection, content } = body;
    
    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Title and slug are required" }, { status: 400 });
    }

    const newLandingPage = await prisma.landingPage.create({
      data: {
        title,
        slug,
        heroSection: heroSection || {},
        packages: packages || [],
        faqSection: faqSection || {},
        content: content || {},
      }
    });

    return jsonSuccess(newLandingPage);
  } catch (error) {
    return jsonError(new Error("Failed to create landing page"));
  }
}
