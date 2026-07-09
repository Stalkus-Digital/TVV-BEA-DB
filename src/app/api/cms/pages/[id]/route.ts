import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const page = await prisma.cmsPage.findUnique({
      where: { id: (await context.params).id }
    });
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return jsonSuccess(page);
  } catch (error) {
    return jsonError(new Error("Failed to fetch page"));
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, slug, content, status } = body;

    const page = await prisma.cmsPage.update({
      where: { id: (await context.params).id },
      data: { title, slug, content, status }
    });

    return jsonSuccess(page);
  } catch (error) {
    return jsonError(new Error("Failed to update page"));
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await prisma.cmsPage.delete({
      where: { id: (await context.params).id }
    });
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(new Error("Failed to delete page"));
  }
}
