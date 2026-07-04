import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { listUserSessionsHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await listUserSessionsHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
