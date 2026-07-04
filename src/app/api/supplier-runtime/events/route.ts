import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getRuntimeEventsHandler } from "@/modules/supplier/runtime";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getRuntimeEventsHandler(searchParams.get("limit"));
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
