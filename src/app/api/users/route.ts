import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createUserHandler, listUsersHandler, readAuthContextFromHeaders } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("isActive");
  const result = await listUsersHandler({
    isActive: isActive ? isActive === "true" : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await createUserHandler(body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
