import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notes = await prisma.enquiryNote.findMany({
      where: { enquiryId: id },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({
      success: true,
      data: notes.map((n) => ({
        id: n.id,
        enquiryId: n.enquiryId,
        authorUserId: n.authorUserId,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.body) {
      return NextResponse.json({ success: false, error: "Note body is required" }, { status: 400 });
    }

    const note = await prisma.enquiryNote.create({
      data: {
        enquiryId: id,
        body: body.body,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: note.id,
        enquiryId: note.enquiryId,
        authorUserId: note.authorUserId,
        body: note.body,
        createdAt: note.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
