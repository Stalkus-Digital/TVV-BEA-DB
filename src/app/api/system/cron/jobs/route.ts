import { NextResponse } from "next/server";
import { getJobQueueService } from "@/modules/system";

export const dynamic = "force-dynamic"; // Always run dynamically

export async function POST(req: Request) {
  // Normally you would protect this with a CRON_SECRET check 
  // const authHeader = req.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse("Unauthorized", { status: 401 });
  // }

  const queue = getJobQueueService();
  const result = await queue.processNext();
  
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: "Failed to process job queue" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, processed: result.value });
}

export async function GET(req: Request) {
  // Allow GET for simple cron triggers (e.g., Vercel Cron)
  return POST(req);
}
