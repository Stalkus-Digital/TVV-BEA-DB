import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notes = await prisma.enquiryNote.findMany({
      where: { enquiryId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { body } = await request.json();

    const note = await prisma.enquiryNote.create({
      data: {
        enquiryId: id,
        body,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
