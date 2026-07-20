import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { restoreAdminCustomerHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await restoreAdminCustomerHandler(id, null);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
