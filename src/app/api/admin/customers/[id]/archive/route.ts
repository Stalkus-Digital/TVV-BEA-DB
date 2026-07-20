import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { archiveAdminCustomerHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await archiveAdminCustomerHandler(id, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
