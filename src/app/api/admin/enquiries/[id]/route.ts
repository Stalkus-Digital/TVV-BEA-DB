import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

function mapEnquiry(enquiry: {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  destinationSlug: string | null;
  packageSlug: string | null;
  hotelSlug: string | null;
  activitySlug: string | null;
  customerId: string | null;
  source: string | null;
  status: string;
  assignedToUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: enquiry.id,
    type: enquiry.type,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    message: enquiry.message,
    destinationSlug: enquiry.destinationSlug,
    packageSlug: enquiry.packageSlug,
    hotelSlug: enquiry.hotelSlug,
    activitySlug: enquiry.activitySlug,
    customerId: enquiry.customerId,
    source: enquiry.source,
    status: enquiry.status,
    assignedToUserId: enquiry.assignedToUserId,
    createdAt: enquiry.createdAt.toISOString(),
    updatedAt: enquiry.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: mapEnquiry(enquiry) });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch enquiry" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.enquiryNote.deleteMany({ where: { enquiryId: id } }),
      prisma.enquiry.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete enquiry" }, { status: 500 });
  }
}
