import { NextResponse } from "next/server";
import { getAiGeneratorService } from "@/modules/package";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";

const logger = createLogger("api.admin.ai");

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { prompt, destination, duration, budget } = payload;

    if (!prompt || !destination || !duration || !budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const aiService = getAiGeneratorService();
    const result = await aiService.generatePackage(prompt, destination, duration, budget);

    if (isErr(result)) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    logger.error("Error in AI package generation route", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
