import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { getInventoryService } from "@/modules/inventory";
import { getDestinationService, getGeographyService } from "@/modules/destination";
import { getPackageService } from "@/modules/package";
import { InventoryKind } from "@/modules/inventory/types";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import {
  SHEET_TO_KIND,
  WORKBOOK_SHEETS,
  asBoolean,
  asNumber,
  asString,
  cell,
} from "@/modules/inventory/catalog/workbook";

const logger = createLogger("api.admin.inventory.upload");

type EntityKind = InventoryKind | "DESTINATION" | "PACKAGE";

interface ImportResults {
  successful: number;
  failed: number;
  errors: string[];
  byType: Record<string, { successful: number; failed: number }>;
}

function bump(results: ImportResults, type: string, ok: boolean, error?: string) {
  if (!results.byType[type]) results.byType[type] = { successful: 0, failed: 0 };
  if (ok) {
    results.successful++;
    results.byType[type].successful++;
  } else {
    results.failed++;
    results.byType[type].failed++;
    if (error) results.errors.push(error);
  }
}

function resolveDestinationId(
  nameOrId: string | undefined,
  destByName: Map<string, string>,
  destById: Set<string>
): string | null {
  if (!nameOrId) return null;
  if (destById.has(nameOrId)) return nameOrId;
  return destByName.get(nameOrId.toLowerCase().trim()) ?? null;
}

function resolveCountryId(
  countryId: string | undefined,
  countryName: string | undefined,
  countryById: Map<string, string>,
  countryByName: Map<string, string>,
  countryByIso: Map<string, string>
): string | undefined {
  if (countryId) {
    if (countryById.has(countryId)) return countryId;
    const byIso = countryByIso.get(countryId.toUpperCase());
    if (byIso) return byIso;
  }
  if (countryName) {
    return countryByName.get(countryName.toLowerCase().trim());
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });

    const inventoryService = getInventoryService();
    const destinationService = getDestinationService();
    const packageService = getPackageService();
    const geographyService = getGeographyService();

    const [destResult, countriesResult] = await Promise.all([
      destinationService.list({ page: 1, pageSize: 10_000 }),
      geographyService.listCountries({ page: 1, pageSize: 500 }),
    ]);

    if (isErr(destResult)) {
      return NextResponse.json({ error: destResult.error.message }, { status: 500 });
    }

    const destinations = destResult.value.items;
    const destByName = new Map<string, string>();
    const destBySlug = new Map<string, string>();
    const destById = new Set<string>();
    for (const d of destinations) {
      destById.add(d.id);
      destByName.set(d.name.toLowerCase().trim(), d.id);
      destBySlug.set(d.slug.toLowerCase().trim(), d.id);
    }

    const countries = isErr(countriesResult) ? [] : countriesResult.value.items;
    const countryById = new Map(countries.map((c) => [c.id, c.id]));
    const countryByName = new Map(countries.map((c) => [c.name.toLowerCase().trim(), c.id]));
    const countryByIso = new Map(countries.map((c) => [c.isoCode.toUpperCase(), c.id]));

    const results: ImportResults = { successful: 0, failed: 0, errors: [], byType: {} };

    const sheetsToProcess: { name: string; kind: EntityKind; rows: Record<string, unknown>[] }[] = [];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName === "_meta" || sheetName.startsWith("_")) continue;
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet) as Record<string, unknown>[];
      if (!rows.length) continue;

      const mappedKind = SHEET_TO_KIND[sheetName];
      if (mappedKind) {
        sheetsToProcess.push({ name: sheetName, kind: mappedKind, rows });
        continue;
      }

      // Fallback: single sheet with Type/Kind column
      const firstType = asString(cell(rows[0], "Type", "Kind", "type", "kind"));
      if (firstType) {
        for (const row of rows) {
          const typeRaw = asString(cell(row, "Type", "Kind", "type", "kind"))?.toUpperCase();
          if (!typeRaw) continue;
          let kind: EntityKind | undefined;
          if (typeRaw === "DESTINATION" || typeRaw === "PACKAGE") kind = typeRaw;
          else if ((Object.values(InventoryKind) as string[]).includes(typeRaw)) {
            kind = typeRaw as InventoryKind;
          } else {
            const sheetKey = Object.keys(SHEET_TO_KIND).find(
              (k) => k.toLowerCase() === typeRaw.toLowerCase()
            );
            if (sheetKey) kind = SHEET_TO_KIND[sheetKey];
          }
          if (!kind) {
            bump(results, "UNKNOWN", false, `Unknown type "${typeRaw}"`);
            continue;
          }
          sheetsToProcess.push({ name: sheetName, kind, rows: [row] });
        }
      } else if (WORKBOOK_SHEETS.includes(sheetName as (typeof WORKBOOK_SHEETS)[number])) {
        // empty known sheet — skip
      } else {
        // Legacy hotel-only sheet without type
        sheetsToProcess.push({ name: sheetName, kind: InventoryKind.HOTEL, rows });
      }
    }

    for (const { name: sheetName, kind, rows } of sheetsToProcess) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowLabel = `${sheetName} row ${i + 2}`;
        try {
          if (kind === "DESTINATION") {
            await importDestination(row, rowLabel, results, {
              destinationService,
              destByName,
              destBySlug,
              destById,
              countryById,
              countryByName,
              countryByIso,
            });
          } else if (kind === "PACKAGE") {
            await importPackage(row, rowLabel, results, {
              packageService,
              destByName,
              destById,
            });
          } else {
            await importInventory(row, rowLabel, kind, results, {
              inventoryService,
              destByName,
              destById,
              countryById,
              countryByName,
              countryByIso,
            });
          }
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Unexpected error";
          bump(results, kind, false, `${rowLabel}: ${message}`);
        }
      }
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Bulk upload failed", { error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function importInventory(
  row: Record<string, unknown>,
  rowLabel: string,
  kind: InventoryKind,
  results: ImportResults,
  ctx: {
    inventoryService: ReturnType<typeof getInventoryService>;
    destByName: Map<string, string>;
    destById: Set<string>;
    countryById: Map<string, string>;
    countryByName: Map<string, string>;
    countryByIso: Map<string, string>;
  }
) {
  const title = asString(cell(row, "title", "Title", "Name", "name"));
  if (!title) {
    bump(results, kind, false, `${rowLabel}: Missing title`);
    return;
  }

  const id = asString(cell(row, "id", "ID"));
  const destName = asString(cell(row, "destination", "Destination"));
  const destinationId = resolveDestinationId(destName, ctx.destByName, ctx.destById);
  const status = asString(cell(row, "status", "Status"));

  let details: Record<string, unknown> = {};

  if (kind === InventoryKind.HOTEL) {
    const lat = asNumber(cell(row, "latitude", "Latitude"));
    const lng = asNumber(cell(row, "longitude", "Longitude"));
    details = {
      starRating: asNumber(cell(row, "starRating", "Star Rating", "Stars")) ?? 3,
      address: asString(cell(row, "address", "Address")) ?? "",
      ...(lat !== undefined ? { latitude: lat } : {}),
      ...(lng !== undefined ? { longitude: lng } : {}),
    };
  } else if (kind === InventoryKind.ACTIVITY) {
    details = {
      durationMinutes: asNumber(cell(row, "durationMinutes", "Duration Minutes")) ?? 60,
      category: asString(cell(row, "category", "Category")) ?? "General",
    };
  } else if (kind === InventoryKind.FLIGHT) {
    details = {
      originAirportCode: asString(cell(row, "originAirportCode", "Origin", "origin")) ?? "",
      destinationAirportCode: asString(cell(row, "destinationAirportCode", "destinationAirportCode", "Destination Airport")) ?? "",
    };
  } else if (kind === InventoryKind.TRANSFER) {
    const origin = asString(cell(row, "originDestination", "Origin Destination"));
    const target = asString(cell(row, "targetDestination", "Target Destination"));
    details = {
      mode: (asString(cell(row, "mode", "Mode")) ?? "ROAD").toUpperCase(),
      originDestinationId: resolveDestinationId(origin, ctx.destByName, ctx.destById) ?? origin ?? "",
      targetDestinationId: resolveDestinationId(target, ctx.destByName, ctx.destById) ?? target ?? "",
    };
  } else if (kind === InventoryKind.VISA) {
    const docsRaw = asString(cell(row, "requiredDocuments", "Required Documents"));
    const countryId =
      resolveCountryId(
        asString(cell(row, "countryId", "Country Id")),
        asString(cell(row, "country", "Country")),
        ctx.countryById,
        ctx.countryByName,
        ctx.countryByIso
      ) ?? asString(cell(row, "countryId", "Country Id")) ?? "placeholder-country";
    details = {
      countryId,
      visaType: (asString(cell(row, "visaType", "Visa Type")) ?? "TOURIST").toUpperCase(),
      entryType: (asString(cell(row, "entryType", "Entry Type")) ?? "SINGLE").toUpperCase(),
      processingDays: asNumber(cell(row, "processingDays", "Processing Days")) ?? 7,
      validityDays: asNumber(cell(row, "validityDays", "Validity Days")) ?? 30,
      requiredDocuments: docsRaw ? docsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
  } else if (kind === InventoryKind.INSURANCE) {
    details = {
      providerName: asString(cell(row, "providerName", "Provider Name")) ?? "",
      coverageAmount: asNumber(cell(row, "coverageAmount", "Coverage Amount")) ?? 0,
      currencyCode: (asString(cell(row, "currencyCode", "Currency")) ?? "INR").toUpperCase(),
      termDays: asNumber(cell(row, "termDays", "Term Days")) ?? 7,
      ...(asString(cell(row, "termsUrl", "Terms Url"))
        ? { termsUrl: asString(cell(row, "termsUrl", "Terms Url")) }
        : {}),
    };
  }

  if (id) {
    const updatePayload: Record<string, unknown> = {
      title,
      destinationId,
      details,
      ...(status ? { status } : {}),
    };
    const result = await ctx.inventoryService.update(id, updatePayload);
    if (isErr(result)) {
      // Fall back to create if not found
      if (result.error.message.toLowerCase().includes("not found")) {
        const createResult = await ctx.inventoryService.create({
          kind,
          title,
          destinationId,
          details,
        });
        if (isErr(createResult)) {
          bump(results, kind, false, `${rowLabel} (${title}): ${createResult.error.message}`);
        } else {
          if (status) {
            await ctx.inventoryService.update(createResult.value.id, { status });
          }
          bump(results, kind, true);
        }
      } else {
        bump(results, kind, false, `${rowLabel} (${title}): ${result.error.message}`);
      }
    } else {
      bump(results, kind, true);
    }
    return;
  }

  const createResult = await ctx.inventoryService.create({
    kind,
    title,
    destinationId,
    details,
  });
  if (isErr(createResult)) {
    bump(results, kind, false, `${rowLabel} (${title}): ${createResult.error.message}`);
    return;
  }
  if (status) {
    await ctx.inventoryService.update(createResult.value.id, { status });
  }
  bump(results, kind, true);
}

async function importDestination(
  row: Record<string, unknown>,
  rowLabel: string,
  results: ImportResults,
  ctx: {
    destinationService: ReturnType<typeof getDestinationService>;
    destByName: Map<string, string>;
    destBySlug: Map<string, string>;
    destById: Set<string>;
    countryById: Map<string, string>;
    countryByName: Map<string, string>;
    countryByIso: Map<string, string>;
  }
) {
  const name = asString(cell(row, "name", "Name", "title", "Title"));
  if (!name) {
    bump(results, "DESTINATION", false, `${rowLabel}: Missing name`);
    return;
  }

  const id = asString(cell(row, "id", "ID"));
  const slug = asString(cell(row, "slug", "Slug"));
  const status = asString(cell(row, "status", "Status"));
  const description = asString(cell(row, "description", "Description"));
  const latitude = asNumber(cell(row, "latitude", "Latitude"));
  const longitude = asNumber(cell(row, "longitude", "Longitude"));
  const isFeatured = asBoolean(cell(row, "isFeatured", "Featured"));
  const parentRaw = asString(cell(row, "parentDestination", "Parent Destination", "parentDestinationId"));
  let parentDestinationId: string | undefined;
  if (parentRaw) {
    parentDestinationId =
      resolveDestinationId(parentRaw, ctx.destByName, ctx.destById) ??
      ctx.destBySlug.get(parentRaw.toLowerCase().trim()) ??
      undefined;
  }

  const countryId = resolveCountryId(
    asString(cell(row, "countryId", "Country Id")),
    asString(cell(row, "country", "Country")),
    ctx.countryById,
    ctx.countryByName,
    ctx.countryByIso
  );

  if (id && ctx.destById.has(id)) {
    const result = await ctx.destinationService.update(id, {
      name,
      ...(description !== undefined ? { description } : {}),
      ...(status ? { status } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    });
    if (isErr(result)) {
      bump(results, "DESTINATION", false, `${rowLabel} (${name}): ${result.error.message}`);
    } else {
      bump(results, "DESTINATION", true);
    }
    return;
  }

  if (!parentDestinationId) {
    bump(
      results,
      "DESTINATION",
      false,
      `${rowLabel} (${name}): parentDestination is required (name/slug of Andaman, Domestic, or International)`
    );
    return;
  }

  const createResult = await ctx.destinationService.create({
    name,
    ...(slug ? { slug } : {}),
    ...(countryId ? { countryId } : {}),
    parentDestinationId,
    ...(description !== undefined ? { description } : {}),
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
  });

  if (isErr(createResult)) {
    bump(results, "DESTINATION", false, `${rowLabel} (${name}): ${createResult.error.message}`);
    return;
  }

  ctx.destById.add(createResult.value.id);
  ctx.destByName.set(createResult.value.name.toLowerCase().trim(), createResult.value.id);
  ctx.destBySlug.set(createResult.value.slug.toLowerCase().trim(), createResult.value.id);

  if (status || isFeatured !== undefined) {
    await ctx.destinationService.update(createResult.value.id, {
      ...(status ? { status } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    });
  }

  bump(results, "DESTINATION", true);
}

async function importPackage(
  row: Record<string, unknown>,
  rowLabel: string,
  results: ImportResults,
  ctx: {
    packageService: ReturnType<typeof getPackageService>;
    destByName: Map<string, string>;
    destById: Set<string>;
  }
) {
  const title = asString(cell(row, "title", "Title", "Name", "name"));
  if (!title) {
    bump(results, "PACKAGE", false, `${rowLabel}: Missing title`);
    return;
  }

  const id = asString(cell(row, "id", "ID"));
  const destRaw = asString(cell(row, "destination", "Destination", "destinationId"));
  const destinationId = resolveDestinationId(destRaw, ctx.destByName, ctx.destById);
  const durationDays = asNumber(cell(row, "durationDays", "Duration Days"));
  const durationNights = asNumber(cell(row, "durationNights", "Duration Nights"));
  const durationText = asString(cell(row, "durationText", "Duration Text"));
  const code = asString(cell(row, "code", "Code"));
  const slug = asString(cell(row, "slug", "Slug"));
  const sourceType = asString(cell(row, "sourceType", "Source Type"));

  if (id) {
    const result = await ctx.packageService.update(id, {
      title,
      ...(durationText !== undefined ? { durationText } : {}),
    });
    if (isErr(result)) {
      if (result.error.message.toLowerCase().includes("not found")) {
        // fall through to create below
      } else {
        bump(results, "PACKAGE", false, `${rowLabel} (${title}): ${result.error.message}`);
        return;
      }
    } else {
      bump(results, "PACKAGE", true);
      return;
    }
  }

  if (!destinationId) {
    bump(results, "PACKAGE", false, `${rowLabel} (${title}): destination is required`);
    return;
  }
  if (durationDays === undefined || durationDays <= 0) {
    bump(results, "PACKAGE", false, `${rowLabel} (${title}): durationDays is required`);
    return;
  }
  if (durationNights === undefined || durationNights < 0) {
    bump(results, "PACKAGE", false, `${rowLabel} (${title}): durationNights is required`);
    return;
  }

  const createResult = await ctx.packageService.create({
    title,
    destinationId,
    durationDays,
    durationNights,
    ...(durationText !== undefined ? { durationText } : {}),
    ...(code ? { code } : {}),
    ...(slug ? { slug } : {}),
    ...(sourceType ? { sourceType } : {}),
  });

  if (isErr(createResult)) {
    bump(results, "PACKAGE", false, `${rowLabel} (${title}): ${createResult.error.message}`);
    return;
  }
  bump(results, "PACKAGE", true);
}
