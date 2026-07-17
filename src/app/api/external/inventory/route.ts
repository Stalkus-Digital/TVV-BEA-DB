import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getDestinationService } from "@/modules/destination";
import { getInventoryService } from "@/modules/inventory";
import type { InventoryItem } from "@/modules/inventory/types";
import { isErr } from "@/shared/types";

type ExternalInventoryRow = InventoryItem & { destinationName?: string | null };

async function enrichWithDestinationNames(items: InventoryItem[]): Promise<ExternalInventoryRow[]> {
  const destinationService = getDestinationService();
  const nameById = new Map<string, string>();

  const uniqueIds = [...new Set(items.map((item) => item.destinationId).filter(Boolean))] as string[];
  await Promise.all(
    uniqueIds.map(async (id) => {
      const result = await destinationService.getById(id);
      if (!isErr(result) && result.value) {
        nameById.set(id, result.value.name);
      }
    }),
  );

  return items.map((item) => ({
    ...item,
    destinationName: item.destinationId ? nameById.get(item.destinationId) ?? null : null,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const result = await getInventoryService().list({
    kind: (kind as "HOTEL" | "ACTIVITY" | "FLIGHT" | "TRANSFER" | "VISA" | "INSURANCE" | null) ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20,
  });

  if (isErr(result)) return jsonError(result.error);

  const items = await enrichWithDestinationNames(result.value.items);
  return jsonSuccess({ ...result.value, items });
}
