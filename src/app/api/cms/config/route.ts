import { NextResponse } from "next/server";
import { CmsConfigService } from "@/modules/website/services/cms-config.service";
import { isErr } from "@/shared/types";
import { jsonSuccess, jsonError } from "@/api/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ success: false, error: "Missing config key" }, { status: 400 });
  }

  const result = await CmsConfigService.getInstance().getConfig(key);
  if (isErr(result)) {
    return jsonError(result.error);
  }

  return jsonSuccess({ key, value: result.value });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Missing key or value" }, { status: 400 });
    }

    const result = await CmsConfigService.getInstance().setConfig(key, value);
    if (isErr(result)) {
      return jsonError(result.error);
    }

    return jsonSuccess({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }
}
