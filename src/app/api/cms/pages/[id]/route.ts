import { NextResponse } from "next/server";
import { jsonSuccess, jsonError } from "@/api/http";
import { updateCmsPage, deleteCmsPage } from "@/features/admin-cms/services/cms-content.service";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const page = await prisma.cmsPage.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return jsonSuccess(page);
  } catch {
    return jsonError(new Error("Failed to fetch page"));
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, slug, content, status } = body;

    const page = await updateCmsPage(id, {
      title,
      slug,
      content: content && typeof content === "object" ? content : {},
      status: status || "DRAFT",
    });

    return jsonSuccess(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteCmsPage(id);
    return jsonSuccess({ success: true });
  } catch {
    return jsonError(new Error("Failed to delete page"));
  }
}
