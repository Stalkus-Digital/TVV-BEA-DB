import { NextResponse } from "next/server";
import { AIService } from "@/modules/ai/ai.service";
import { createLogger } from "@/shared/logger";

const aiService = new AIService({ logger: createLogger("api.ai") });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.destination || !body.durationDays) {
      return NextResponse.json({ error: "destination and durationDays are required" }, { status: 400 });
    }

    const result = await aiService.generateHolidayPackage(body);
    if (result.ok) {
      return NextResponse.json(result.value, { status: 201 });
    }
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
