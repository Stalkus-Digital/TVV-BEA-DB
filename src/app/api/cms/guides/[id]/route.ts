import { NextResponse } from "next/server";
import { jsonSuccess, jsonError } from "@/api/http";
import { updateCmsGuide, deleteCmsGuide } from "@/features/admin-cms/services/cms-content.service";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const guide = await prisma.cmsGuide.findUnique({ where: { id } });
    if (!guide) {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 });
    }
    return jsonSuccess(guide);
  } catch {
    return jsonError(new Error("Failed to fetch guide"));
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, slug, content, authorId, status } = body;

    const guide = await updateCmsGuide(id, {
      title,
      slug,
      content: content && typeof content === "object" ? content : {},
      authorId: authorId ?? null,
      status: status || "DRAFT",
    });

    return jsonSuccess(guide);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update guide";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteCmsGuide(id);
    return jsonSuccess({ success: true });
  } catch {
    return jsonError(new Error("Failed to delete guide"));
  }
}
