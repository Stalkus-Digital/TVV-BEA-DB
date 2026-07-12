import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  try {
    const airports = await prisma.airport.findMany();
    return NextResponse.json({ success: true, data: airports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
