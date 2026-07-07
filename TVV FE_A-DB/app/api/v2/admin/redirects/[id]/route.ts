/**
 * Single-redirect ops.
 *
 *  PATCH  /api/v2/admin/redirects/[id]   { toPath?, statusCode?, isActive?, reason? }
 *  DELETE /api/v2/admin/redirects/[id]   hard delete (admin sometimes wants this)
 *
 *  Most "delete" ops should set isActive=false instead — the history is
 *  occasionally useful when SEO debugging.
 */

import { NextResponse } from "next/server";
import { hierarchyDb, deleteRedirect, bustRedirectCache } from "@/lib/hierarchy";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (typeof b.toPath === "string") data.toPath = b.toPath;
  if (typeof b.statusCode === "number") {
    if (![301, 302, 307, 308].includes(b.statusCode)) {
      return NextResponse.json({ error: "invalid_status_code" }, { status: 400 });
    }
    data.statusCode = b.statusCode;
  }
  if (typeof b.isActive === "boolean") data.isActive = b.isActive;
  if (typeof b.reason === "string" || b.reason === null) data.reason = b.reason;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  try {
    const updated = await hierarchyDb.redirect.update({
      where: { id: BigInt(id) },
      data,
    });
    bustRedirectCache();
    return NextResponse.json({
      redirect: {
        ...updated,
        id: updated.id.toString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "redirect_not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteRedirect(BigInt(id));
    bustRedirectCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "redirect_not_found" }, { status: 404 });
  }
}
