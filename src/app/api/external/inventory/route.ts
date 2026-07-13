import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getInventoryService } from "@/modules/inventory";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const result = await getInventoryService().list({
    kind: (kind as any) ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20,
  });
  
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
