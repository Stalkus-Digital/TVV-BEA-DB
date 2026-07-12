import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const experience = await prisma.inventoryItem.findFirst({
      where: { kind: "ACTIVITY", status: "ACTIVE", id: slug } // Using id as slug for now
    });
    if (!experience) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: experience });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
