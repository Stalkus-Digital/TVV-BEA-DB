import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  try {
    const experiences = await prisma.inventoryItem.findMany({
      where: { kind: "ACTIVITY", status: "ACTIVE" }
    });
    return NextResponse.json({ success: true, data: experiences });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
