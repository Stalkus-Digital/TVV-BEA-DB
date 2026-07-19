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
      const status = result.error.name === "ValidationError" ? 400 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    const pkgData = result.value;

    // Prefer destination resolved during catalog load; fall back to name match
    let destId = pkgData.destinationId ?? null;
    if (!destId) {
      let dest = await prisma.destination.findFirst({
        where: { name: { contains: destination, mode: "insensitive" } },
      });
      if (!dest) dest = await prisma.destination.findFirst();
      destId = dest?.id ?? null;
    }

    if (!destId) {
      logger.warn("No destinations exist in DB to anchor AI package. Returning without persistence.");
      return NextResponse.json(pkgData);
    }

    const builder = getAIPackageBuilder();
    const buildResult = await builder.build({
      title: pkgData.title,
      destinationId: destId,
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
          inventoryItemId: item.inventoryItemId ?? null,
        })),
      })),
    });

    if (isErr(buildResult)) {
      logger.error("Failed to persist AI package", { error: buildResult.error.message });
      return NextResponse.json({
        ...pkgData,
        persistError: buildResult.error.message,
      });
    }

    return NextResponse.json({
      ...pkgData,
      persistedPackageId: buildResult.value.id,
    });
  } catch (error) {
    logger.error("Error in AI package generation route", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
