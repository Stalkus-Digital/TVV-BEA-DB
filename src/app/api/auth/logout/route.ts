import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { logoutHandler, readAuthContextFromHeaders } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const result = await logoutHandler(context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
