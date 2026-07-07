import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

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
    return NextResponse.json({ success: false, error: "Failed to fetch lead" }, { status: 500 });
  }
}
