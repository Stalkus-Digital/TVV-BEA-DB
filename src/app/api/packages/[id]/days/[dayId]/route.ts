import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removePackageDayHandler, updatePackageDayHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string; dayId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { dayId } = await params;
  const body = await request.json().catch(() => null);
  const result = await updatePackageDayHandler(dayId, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { dayId } = await params;
  const result = await removePackageDayHandler(dayId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
