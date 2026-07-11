import { NextResponse } from "next/server";
import { getAiGeneratorService, getAIPackageBuilder } from "@/modules/package";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import { prisma } from "@/shared/database/prisma-client";

const logger = createLogger("api.admin.ai.generate-package");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const destination = body.destination ?? "";
    const durationDays = body.durationDays ?? 7;
    const theme = body.theme ?? "general leisure";

    if (!destination) {
      return NextResponse.json({ error: "destination is required" }, { status: 400 });
    }

    const prompt = `Generate a ${durationDays}-day ${theme} holiday package for ${destination}.`;
    const aiService = getAiGeneratorService();
    const result = await aiService.generatePackage(prompt, destination, `${durationDays} days`, "mid-range");

    if (isErr(result)) {
      logger.error("AI package generation failed", { error: result.error.message });
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const pkgData = result.value;

    // ✅ HR-2 FIX: Persist AI generated itinerary to DB
    let dest = await prisma.destination.findFirst({
      where: { name: { contains: destination, mode: "insensitive" } }
    });

    if (!dest) dest = await prisma.destination.findFirst();

    if (dest) {
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

      if (!isErr(buildResult)) {
        (pkgData as any).persistedPackageId = buildResult.value.id;
      } else {
        logger.error("Failed to persist AI package", { error: buildResult.error.message });
      }
    }

    return NextResponse.json(pkgData, { status: 201 });
  } catch (error) {
    logger.error("Error in AI generate-package route", { error });
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
