import { NextResponse } from "next/server";
import { getAiGeneratorService, getAIPackageBuilder } from "@/modules/package";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import { prisma } from "@/shared/database/prisma-client";

const logger = createLogger("api.admin.ai");

/** Allow OpenAI + optional TripJack enrichment enough time on Vercel. */
export const maxDuration = 60;

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
    const warnings = [...(pkgData.warnings ?? [])];

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
      warnings.push("Package generated but not saved — no destination in the database.");
      return NextResponse.json({ ...pkgData, warnings });
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
      warnings.push(`Package generated but not saved: ${buildResult.error.message}`);
      return NextResponse.json({
        ...pkgData,
        warnings,
        persistError: buildResult.error.message,
      });
    }

    return NextResponse.json({
      ...pkgData,
      warnings,
      persistedPackageId: buildResult.value.id,
    });
  } catch (error) {
    logger.error("Error in AI package generation route", { error });
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
