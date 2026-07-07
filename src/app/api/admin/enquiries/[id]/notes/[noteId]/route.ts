import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { deleteAdminEnquiryNoteHandler, updateAdminEnquiryNoteHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string; noteId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, noteId } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateAdminEnquiryNoteHandler(id, noteId, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, noteId } = await params;
  const result = await deleteAdminEnquiryNoteHandler(id, noteId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ deleted: true });
}
