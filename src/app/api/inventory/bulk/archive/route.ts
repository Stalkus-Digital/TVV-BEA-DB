import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { bulkArchiveInventoryHandler } from "@/modules/inventory";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await bulkArchiveInventoryHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
