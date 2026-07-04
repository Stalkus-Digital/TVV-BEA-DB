import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getWebsiteDestinationDetailHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getWebsiteDestinationDetailHandler(slug);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
