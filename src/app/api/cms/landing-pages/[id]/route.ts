import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: (await context.params).id }
    });
    if (!landingPage) {
      return NextResponse.json({ success: false, error: "Landing page not found" }, { status: 404 });
    }
    return jsonSuccess(landingPage);
  } catch (error) {
    return jsonError(new Error("Failed to fetch landing page"));
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, slug, heroSection, packages, faqSection, content } = body;

    const landingPage = await prisma.landingPage.update({
      where: { id: (await context.params).id },
      data: { title, slug, heroSection, packages, faqSection, content }
    });

    return jsonSuccess(landingPage);
  } catch (error) {
    return jsonError(new Error("Failed to update landing page"));
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await prisma.landingPage.delete({
      where: { id: (await context.params).id }
    });
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(new Error("Failed to delete landing page"));
  }
}
