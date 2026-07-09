import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request) {
  try {
    const guides = await prisma.cmsGuide.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return jsonSuccess({ items: guides });
  } catch (error) {
    return jsonError(new Error("Failed to fetch guides"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, authorId, status } = body;
    
    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Title and slug are required" }, { status: 400 });
    }

    const newGuide = await prisma.cmsGuide.create({
      data: {
        title,
        slug,
        content: content || [],
        authorId,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      }
    });

    return jsonSuccess(newGuide);
  } catch (error) {
    return jsonError(new Error("Failed to create guide"));
  }
}
