import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { removeDocumentHandler, updateDocumentHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params;
  const body = await request.json().catch(() => null);
  const context = readAuthContextFromHeaders(request.headers);
  const result = await updateDocumentHandler(id, documentId, body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await removeDocumentHandler(id, documentId, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ ok: true });
}
