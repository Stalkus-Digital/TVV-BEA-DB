import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    const mapped = {
      id: enquiry.id,
      type: enquiry.type,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      destinationSlug: enquiry.destinationSlug,
      packageSlug: enquiry.packageSlug,
      customerId: enquiry.customerId,
      source: enquiry.source,
      status: enquiry.status,
      assignedToUserId: enquiry.assignedToUserId,
      createdAt: enquiry.createdAt.toISOString(),
      updatedAt: enquiry.updatedAt.toISOString(),
    };

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch enquiry" }, { status: 500 });
  }
}
