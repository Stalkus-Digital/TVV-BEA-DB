import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  try {
    const routes = await prisma.ferryRoute.findMany({
      where: { active: true },
      include: { schedules: true }
    });
    return NextResponse.json({ success: true, data: routes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
