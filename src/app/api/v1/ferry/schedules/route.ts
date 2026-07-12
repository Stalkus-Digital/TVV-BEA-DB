import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 🚨 DAY-0 DELIVERY: Graceful Fallback
  return NextResponse.json({ success: true, data: [] });
}
