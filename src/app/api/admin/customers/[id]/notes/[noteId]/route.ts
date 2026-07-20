import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { deleteAdminCustomerNoteHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string; noteId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, noteId } = await params;
  const result = await deleteAdminCustomerNoteHandler(id, noteId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ id: noteId });
}
