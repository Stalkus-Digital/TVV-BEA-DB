import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { listMyDocumentsHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const result = await listMyDocumentsHandler(context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
