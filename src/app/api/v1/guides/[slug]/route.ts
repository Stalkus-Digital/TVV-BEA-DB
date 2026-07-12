import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const guide = await prisma.guide.findUnique({
      where: { slug }
    });
    if (!guide) {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: guide });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
