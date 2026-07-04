import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { addPackageAvailabilityHandler, listPackageAvailabilityHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await listPackageAvailabilityHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await addPackageAvailabilityHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
