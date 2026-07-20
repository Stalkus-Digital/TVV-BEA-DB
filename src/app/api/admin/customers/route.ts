import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { createAdminCustomerHandler, listAdminCustomersHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emailVerified = searchParams.get("emailVerified") as "all" | "verified" | "unverified" | null;
  const isActiveParam = searchParams.get("isActive");

  const result = await listAdminCustomersHandler({
    search: searchParams.get("search") ?? undefined,
    emailVerified: emailVerified ?? undefined,
    isActive: isActiveParam === null ? undefined : isActiveParam === "true",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await createAdminCustomerHandler(body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
