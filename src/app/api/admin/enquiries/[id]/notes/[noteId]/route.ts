import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  try {
    const { noteId } = await params;
    const { body } = await request.json();

    const note = await prisma.enquiryNote.update({
      where: { id: noteId },
      data: { body },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  try {
    const { noteId } = await params;
    await prisma.enquiryNote.delete({
      where: { id: noteId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete note" }, { status: 500 });
  }
}
