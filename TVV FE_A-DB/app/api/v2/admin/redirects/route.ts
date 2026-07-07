/**
 * Admin redirect management.
 *
 *  GET  /api/v2/admin/redirects?source=&isActive=&search=&limit=&cursor=
 *       — list with filters; cursor-based pagination
 *
 *  POST /api/v2/admin/redirects
 *       body: { fromPath, toPath, statusCode?, locale?, reason? }
 *       — manual redirect (source=MANUAL)
 *
 *  Auth note: this surface is admin-only. In the current codebase the
 *  admin app sits behind `AuthGuard` and an admin JWT; that gate is
 *  enforced upstream (admin-v2 hits these via its own server-side fetch).
 *  Plug a header check here if you ever expose the API directly.
 */

import { NextResponse } from "next/server";
import {
  listRedirects,
  createManualRedirect,
  bustRedirectCache,
} from "@/lib/hierarchy";

export const dynamic = "force-dynamic"; // admin surface — no caching

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = url.searchParams.get("source") as
    | "MANUAL"
    | "SLUG_HISTORY"
    | "IMPORT"
    | null;
  const isActiveParam = url.searchParams.get("isActive");
  const search = url.searchParams.get("search") ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  const cursorRaw = url.searchParams.get("cursor");

  const rows = await listRedirects({
    source: source ?? undefined,
    isActive: isActiveParam === null ? undefined : isActiveParam === "true",
    search,
    limit,
    cursor: cursorRaw ? BigInt(cursorRaw) : undefined,
  });

  return NextResponse.json({
    redirects: rows.map(serialise),
    nextCursor: rows.length === limit ? rows[rows.length - 1].id.toString() : null,
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const fromPath = typeof b.fromPath === "string" ? b.fromPath : null;
  const toPath = typeof b.toPath === "string" ? b.toPath : null;
  if (!fromPath || !toPath) {
    return NextResponse.json(
      { error: "fromPath_and_toPath_required" },
      { status: 400 },
    );
  }

  const statusCode = typeof b.statusCode === "number" ? b.statusCode : 301;
  if (![301, 302, 307, 308].includes(statusCode)) {
    return NextResponse.json({ error: "invalid_status_code" }, { status: 400 });
  }

  try {
    const row = await createManualRedirect({
      fromPath,
      toPath,
      statusCode,
      locale: typeof b.locale === "string" ? b.locale : null,
      reason: typeof b.reason === "string" ? b.reason : null,
    });
    bustRedirectCache();
    return NextResponse.json({ redirect: serialise(row) }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    // Map unique-violation on fromPath to a 409
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "from_path_already_exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

function serialise(r: {
  id: bigint;
  fromPath: string;
  toPath: string;
  statusCode: number;
  locale: string | null;
  source: "MANUAL" | "SLUG_HISTORY" | "IMPORT";
  reason: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id.toString(),
    fromPath: r.fromPath,
    toPath: r.toPath,
    statusCode: r.statusCode,
    locale: r.locale,
    source: r.source,
    reason: r.reason,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
