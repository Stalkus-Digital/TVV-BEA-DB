import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    return NextResponse.json({
      id: enquiry.id,
      status: enquiry.status,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
