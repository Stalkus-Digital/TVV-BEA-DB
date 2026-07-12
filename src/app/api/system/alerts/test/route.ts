import { NextResponse } from "next/server";

export async function POST() {
  // 🚨 DAY-0 DELIVERY: Graceful Fallback / Mock
  // Returns success so the UI test button works.
  return NextResponse.json({
    success: true,
    message: "Test alert dispatched successfully (Mocked)",
  });
}
