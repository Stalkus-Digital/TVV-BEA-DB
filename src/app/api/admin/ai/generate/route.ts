import { NextResponse } from "next/server";
import { getAiGeneratorService, getAIPackageBuilder } from "@/modules/package";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import { prisma } from "@/shared/database/prisma-client";

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

    const pkgData = result.value;

    // ✅ HR-2 FIX: Persist AI generated itinerary to DB
    // 1. Find a matching destination, or fall back to the first one available
    let dest = await prisma.destination.findFirst({
      where: { name: { contains: destination, mode: "insensitive" } }
    });

    if (!dest) {
      dest = await prisma.destination.findFirst();
    }

    if (!dest) {
      logger.warn("No destinations exist in DB to anchor AI package. Returning without persistence.");
      return NextResponse.json(pkgData);
    }

    // 2. Save Package + Days + Items in one transaction via the existing AIPackageBuilder
    const builder = getAIPackageBuilder();
    const buildResult = await builder.build({
      title: pkgData.title,
      destinationId: dest.id,
      durationDays: pkgData.durationDays,
      durationNights: pkgData.durationNights,
      aiGenerationReferenceId: "ai_gen_" + Date.now(),
      days: pkgData.days.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title,
        items: d.items.map((item) => ({
          kind: item.kind,
          title: item.title,
          description: item.description,
        })),
      })),
    });

    if (isErr(buildResult)) {
      logger.error("Failed to persist AI package", { error: buildResult.error.message });
      // Still return the generated data even if saving fails
      return NextResponse.json(pkgData);
    }

    return NextResponse.json({
      ...pkgData,
      persistedPackageId: buildResult.value.id
    });
  } catch (error) {
    logger.error("Error in AI package generation route", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
