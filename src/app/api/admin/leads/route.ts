import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedToUserId");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    let where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lead.count({ where }),
    ]);

    const items = leads.map(lead => ({
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
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        sourceUrl: body.sourceUrl || "Manual Entry",
        status: "NEW",
        createdAt: new Date(),
      },
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
    return NextResponse.json({ success: false, error: "Failed to create lead" }, { status: 500 });
  }
}
