import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { deleteAdminEnquiryNoteHandler, updateAdminEnquiryNoteHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string; noteId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, noteId } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await updateAdminEnquiryNoteHandler(id, noteId, body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id, noteId } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await deleteAdminEnquiryNoteHandler(id, noteId, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ id: noteId });
}
