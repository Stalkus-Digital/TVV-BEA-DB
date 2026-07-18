import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { getInventoryService } from "@/modules/inventory";
import { getDestinationService, getGeographyService } from "@/modules/destination";
import { getPackageService } from "@/modules/package";
import { InventoryKind } from "@/modules/inventory/types";
import { isErr } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import {
  KIND_TO_SHEET,
  WORKBOOK_META,
  WORKBOOK_SHEETS,
  type WorkbookSheetKey,
} from "@/modules/inventory/catalog/workbook";

const logger = createLogger("api.admin.inventory.export");

function matchSearch(haystack: string, search?: string | null): boolean {
  if (!search?.trim()) return true;
  return haystack.toLowerCase().includes(search.trim().toLowerCase());
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const kindFilter = url.searchParams.get("kind") || undefined;
    const destinationId = url.searchParams.get("destinationId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const inventoryService = getInventoryService();
    const destinationService = getDestinationService();
    const packageService = getPackageService();
    const geographyService = getGeographyService();

    const [invResult, destResult, pkgResult, countriesResult] = await Promise.all([
      inventoryService.list({ page: 1, pageSize: 10_000 }),
      destinationService.list({ page: 1, pageSize: 10_000 }),
      packageService.list({ page: 1, pageSize: 10_000 }),
      geographyService.listCountries({ page: 1, pageSize: 500 }),
    ]);

    if (isErr(invResult)) {
      return NextResponse.json({ error: invResult.error.message }, { status: 500 });
    }
    if (isErr(destResult)) {
      return NextResponse.json({ error: destResult.error.message }, { status: 500 });
    }
    if (isErr(pkgResult)) {
      return NextResponse.json({ error: pkgResult.error.message }, { status: 500 });
    }

    const destinations = destResult.value.items;
    const destById = new Map(destinations.map((d) => [d.id, d]));
    const countries = isErr(countriesResult) ? [] : countriesResult.value.items;
    const countryById = new Map(countries.map((c) => [c.id, c]));

    let inventory = invResult.value.items.filter((item) => item.status !== "ARCHIVED");
    let packages = pkgResult.value.items.filter((p) => p.status !== "ARCHIVED");
    let destRows = destinations.filter((d) => d.status !== "ARCHIVED");

    if (kindFilter) {
      if (kindFilter === "DESTINATION") {
        inventory = [];
        packages = [];
      } else if (kindFilter === "PACKAGE") {
        inventory = [];
        destRows = [];
      } else {
        inventory = inventory.filter((i) => i.kind === kindFilter);
        packages = [];
        destRows = [];
      }
    }

    if (destinationId) {
      inventory = inventory.filter((i) => i.destinationId === destinationId);
      packages = packages.filter((p) => p.destinationId === destinationId);
      destRows = destRows.filter((d) => d.id === destinationId);
    }

    if (status) {
      inventory = inventory.filter((i) => i.status === status);
      packages = packages.filter((p) => p.status === status);
      destRows = destRows.filter((d) => d.status === status);
    }

    if (search?.trim()) {
      inventory = inventory.filter((i) => matchSearch(`${i.title} ${i.kind}`, search));
      packages = packages.filter((p) => matchSearch(`${p.title} ${p.code}`, search));
      destRows = destRows.filter((d) => matchSearch(`${d.name} ${d.slug}`, search));
    }

    const sheetRows: Record<WorkbookSheetKey, Record<string, unknown>[]> = {
      Hotels: [],
      Activities: [],
      Flights: [],
      Transfers: [],
      Visa: [],
      Insurance: [],
      Destinations: [],
      Packages: [],
    };

    for (const item of inventory) {
      const sheet = KIND_TO_SHEET[item.kind] as WorkbookSheetKey | undefined;
      if (!sheet) continue;
      const destName = item.destinationId ? destById.get(item.destinationId)?.name ?? "" : "";
      const details = item.details as Record<string, unknown>;

      if (item.kind === InventoryKind.HOTEL) {
        sheetRows.Hotels.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          starRating: details.starRating ?? "",
          address: details.address ?? "",
          latitude: details.latitude ?? "",
          longitude: details.longitude ?? "",
        });
      } else if (item.kind === InventoryKind.ACTIVITY) {
        sheetRows.Activities.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          durationMinutes: details.durationMinutes ?? "",
          category: details.category ?? "",
        });
      } else if (item.kind === InventoryKind.FLIGHT) {
        sheetRows.Flights.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          originAirportCode: details.originAirportCode ?? "",
          destinationAirportCode: details.destinationAirportCode ?? "",
        });
      } else if (item.kind === InventoryKind.TRANSFER) {
        sheetRows.Transfers.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          mode: details.mode ?? "",
          originDestination: destById.get(String(details.originDestinationId ?? ""))?.name ?? details.originDestinationId ?? "",
          targetDestination: destById.get(String(details.targetDestinationId ?? ""))?.name ?? details.targetDestinationId ?? "",
        });
      } else if (item.kind === InventoryKind.VISA) {
        const countryId = String(details.countryId ?? "");
        sheetRows.Visa.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          countryId,
          country: countryById.get(countryId)?.name ?? "",
          visaType: details.visaType ?? "",
          entryType: details.entryType ?? "",
          processingDays: details.processingDays ?? "",
          validityDays: details.validityDays ?? "",
          requiredDocuments: Array.isArray(details.requiredDocuments)
            ? details.requiredDocuments.join(",")
            : "",
        });
      } else if (item.kind === InventoryKind.INSURANCE) {
        sheetRows.Insurance.push({
          id: item.id,
          title: item.title,
          destination: destName,
          status: item.status,
          providerName: details.providerName ?? "",
          coverageAmount: details.coverageAmount ?? "",
          currencyCode: details.currencyCode ?? "",
          termDays: details.termDays ?? "",
          termsUrl: details.termsUrl ?? "",
        });
      }
    }

    for (const d of destRows) {
      sheetRows.Destinations.push({
        id: d.id,
        name: d.name,
        slug: d.slug,
        status: d.status,
        country: d.countryId ? countryById.get(d.countryId)?.name ?? "" : "",
        countryId: d.countryId ?? "",
        parentDestination: d.parentDestinationId
          ? destById.get(d.parentDestinationId)?.name ?? d.parentDestinationId
          : "",
        description: d.description ?? "",
        latitude: d.latitude ?? "",
        longitude: d.longitude ?? "",
        isFeatured: d.isFeatured,
      });
    }

    for (const p of packages) {
      sheetRows.Packages.push({
        id: p.id,
        title: p.title,
        code: p.code,
        slug: p.slug,
        destination: destById.get(p.destinationId)?.name ?? "",
        status: p.status,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        durationText: p.durationText ?? "",
        sourceType: p.sourceType,
      });
    }

    const workbook = xlsx.utils.book_new();

    const metaRows = WORKBOOK_META.map((m) => ({
      sheet: m.sheet,
      column: m.column,
      required: m.required ? "yes" : "no",
      type: m.type,
      allowedValues: m.allowedValues,
      notes: m.notes,
      example: m.example,
    }));
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(metaRows), "_meta");

    for (const sheetName of WORKBOOK_SHEETS) {
      const rows = sheetRows[sheetName];
      const columns = WORKBOOK_META.filter((m) => m.sheet === sheetName).map((m) => m.column);
      const sheet =
        rows.length > 0
          ? xlsx.utils.json_to_sheet(rows, { header: columns })
          : xlsx.utils.aoa_to_sheet([columns]);
      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const date = new Date().toISOString().slice(0, 10);
    const filename = `tvv-catalog-export-${date}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Catalog export failed", { error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
