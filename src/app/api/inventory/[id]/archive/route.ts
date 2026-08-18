import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { archiveInventoryItemHandler } from "@/modules/inventory";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await archiveInventoryItemHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
