import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { deleteAdminEnquiryHandler, getAdminEnquiryHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await getAdminEnquiryHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await deleteAdminEnquiryHandler(id, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ id });
}
