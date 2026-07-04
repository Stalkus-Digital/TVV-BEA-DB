import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { listSuppliersHandler } from "@/modules/supplier";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listSuppliersHandler({ capability: searchParams.get("capability") });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
