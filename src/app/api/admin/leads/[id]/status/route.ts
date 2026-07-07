import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    const mapped = {
      id: lead.id,
      type: "GENERAL",
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: null,
      destinationSlug: null,
      packageSlug: null,
      customerId: null,
      source: lead.sourceUrl,
      status: lead.status,
      assignedToUserId: lead.assignedTo,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
