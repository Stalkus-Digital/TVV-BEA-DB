import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { listMyQuotesHandler, submitQuoteRequestHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const { searchParams } = new URL(request.url);
  const result = await listMyQuotesHandler(context, {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await submitQuoteRequestHandler(context, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
