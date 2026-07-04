import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removeDestinationGalleryImageHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  const result = await removeDestinationGalleryImageHandler(id, imageId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
