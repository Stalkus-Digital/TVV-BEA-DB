import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getAdminCustomerHandler, updateAdminCustomerHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await getAdminCustomerHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateAdminCustomerHandler(id, body, null);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
