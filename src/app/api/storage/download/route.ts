import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/api";
import { downloadHandler } from "@/modules/storage";
import { isErr } from "@/shared/types";

/** Deliberately unauthenticated (see route-permission-map.ts) — the signed HMAC query params are the credential, not a JWT. */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await downloadHandler(searchParams.get("key"), searchParams.get("expiresAt"), searchParams.get("signature"));
  if (isErr(result)) return jsonError(result.error);

  return new NextResponse(new Uint8Array(result.value.body), {
    status: 200,
    headers: {
      "Content-Type": result.value.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
