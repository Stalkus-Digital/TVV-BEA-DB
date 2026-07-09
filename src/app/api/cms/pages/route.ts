import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request) {
  try {
    const pages = await prisma.cmsPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return jsonSuccess({ items: pages });
  } catch (error) {
    return jsonError(new Error("Failed to fetch static pages"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, status } = body;
    
    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Title and slug are required" }, { status: 400 });
    }

    const newPage = await prisma.cmsPage.create({
      data: {
        title,
        slug,
        content: content || [],
        status: status || "DRAFT",
      }
    });

    return jsonSuccess(newPage);
  } catch (error) {
    return jsonError(new Error("Failed to create static page"));
  }
}
