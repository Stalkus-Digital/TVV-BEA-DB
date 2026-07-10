import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedToUserId");
    const type = searchParams.get("type");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    let where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedToUserId = assignedTo;
    if (type) where.type = type;

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.enquiry.count({ where }),
    ]);

    const items = enquiries.map((enquiry) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ success: false, error: "Not implemented. Use /status or /assign endpoints." }, { status: 501 });
}
