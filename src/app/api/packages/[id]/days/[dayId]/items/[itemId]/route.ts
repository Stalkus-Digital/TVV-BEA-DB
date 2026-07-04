import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removePackageItemHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string; itemId: string }> }
) {
  const { itemId } = await params;
  const result = await removePackageItemHandler(itemId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
