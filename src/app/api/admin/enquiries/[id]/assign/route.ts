import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { assignedToUserId } = await request.json();

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { assignedToUserId, updatedAt: new Date() },
    });

    return NextResponse.json({
      id: enquiry.id,
      assignedToUserId: enquiry.assignedToUserId,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to assign enquiry" }, { status: 500 });
  }
}
