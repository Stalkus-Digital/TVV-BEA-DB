import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getSupplierHealthHandler } from "@/modules/supplier";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const result = await getSupplierHealthHandler(code);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
