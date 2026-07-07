import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { assignedToUserId } = await request.json();
    
    const lead = await prisma.lead.update({
      where: { id },
      data: { assignedTo: assignedToUserId },
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
    return NextResponse.json({ success: false, error: "Failed to assign lead" }, { status: 500 });
  }
}
