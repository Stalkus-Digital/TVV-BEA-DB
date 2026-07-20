import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { unpublishDestinationHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await unpublishDestinationHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
