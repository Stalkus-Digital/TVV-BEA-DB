import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { archivePackageHandler, getPackageHandler, updatePackageHandler } from "@/modules/package";
import { isErr } from "@/shared/types";
import { notifyWebsitePackageChange } from "@/shared/lib/website-revalidate";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await getPackageHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updatePackageHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await archivePackageHandler(id);
  if (isErr(result)) return jsonError(result.error);

  void notifyWebsitePackageChange(result.value.slug);

  return jsonSuccess(result.value);
}
