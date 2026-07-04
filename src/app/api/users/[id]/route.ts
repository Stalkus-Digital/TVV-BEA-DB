import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { deactivateUserHandler, getUserHandler, updateUserHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await getUserHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateUserHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await deactivateUserHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
