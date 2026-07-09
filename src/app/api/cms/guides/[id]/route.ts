import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const guide = await prisma.cmsGuide.findUnique({
      where: { id: (await context.params).id }
    });
    if (!guide) {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 });
    }
    return jsonSuccess(guide);
  } catch (error) {
    return jsonError(new Error("Failed to fetch guide"));
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, slug, content, authorId, status } = body;

    const guide = await prisma.cmsGuide.update({
      where: { id: (await context.params).id },
      data: {
        title,
        slug,
        content,
        authorId,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      }
    });

    return jsonSuccess(guide);
  } catch (error) {
    return jsonError(new Error("Failed to update guide"));
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await prisma.cmsGuide.delete({
      where: { id: (await context.params).id }
    });
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(new Error("Failed to delete guide"));
  }
}
