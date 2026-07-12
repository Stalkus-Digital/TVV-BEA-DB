import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const route = await prisma.ferryRoute.findUnique({
      where: { id: slug }, // Assuming slug is the ID for now
      include: { schedules: true }
    });
    if (!route) {
      return NextResponse.json({ success: false, error: "Ferry route not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: route });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
