import { NextResponse } from "next/server";
import { getInventoryService } from "@/modules/inventory";
import { prisma } from "@/shared/database/prisma-client";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import * as xlsx from "xlsx";
import { InventoryKind } from "@/modules/inventory/types";

const logger = createLogger("api.admin.inventory.upload");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    const inventoryService = getInventoryService();
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    // Prefetch all destinations to avoid N+1 queries
    const allDestinations = await prisma.destination.findMany({ select: { id: true, name: true } });
    const destMap = new Map<string, string>(
      allDestinations.map((d) => [d.name.toLowerCase().trim(), d.id])
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const title = row["Title"] || row["Name"] || row["title"] || row["name"];
        if (!title) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing Title`);
          continue;
        }

        const destName = row["Destination"] || row["destination"];
        let destinationId: string | null = null;
        if (destName && destMap.has(String(destName).toLowerCase().trim())) {
          destinationId = destMap.get(String(destName).toLowerCase().trim()) || null;
        }

        const starRating = Number(row["Star Rating"] || row["Stars"] || row["starRating"]) || 3;
        const address = row["Address"] || row["address"] || "";
        const latitude = Number(row["Latitude"] || row["latitude"]) || undefined;
        const longitude = Number(row["Longitude"] || row["longitude"]) || undefined;

        const createInput = {
          kind: InventoryKind.HOTEL,
          title: String(title),
          destinationId,
          details: {
            starRating,
            address: String(address),
            latitude,
            longitude,
          },
        };

        const result = await inventoryService.create(createInput);
        if (isErr(result)) {
          results.failed++;
          results.errors.push(`Row ${i + 2} (${title}): ${result.error.message}`);
        } else {
          results.successful++;
        }
      } catch (e: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: Unexpected error - ${e.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    logger.error("Bulk upload failed", { error: error.message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
