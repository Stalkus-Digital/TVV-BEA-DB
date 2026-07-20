import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { duplicateDestinationHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await duplicateDestinationHandler(params.id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
