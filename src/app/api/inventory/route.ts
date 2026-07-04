import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createInventoryItemHandler, listInventoryHandler, INVENTORY_KINDS, type InventoryKind } from "@/modules/inventory";
import { ValidationError } from "@/shared/errors";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kindParam = searchParams.get("kind");

  if (kindParam && !INVENTORY_KINDS.includes(kindParam as InventoryKind)) {
    return jsonError(new ValidationError(`kind must be one of: ${INVENTORY_KINDS.join(", ")}`));
  }

  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  const result = await listInventoryHandler({
    kind: kindParam ? (kindParam as InventoryKind) : undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createInventoryItemHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
