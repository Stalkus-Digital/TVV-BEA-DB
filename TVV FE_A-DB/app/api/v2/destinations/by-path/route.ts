/**
 * GET /api/v2/destinations/by-path?path=<slug-path>
 *
 *  Resolve a slug path to a destination, e.g.
 *    GET /api/v2/destinations/by-path?path=asia-pacific/india/andaman
 *
 *  Returns the rich detail shape — what the catch-all route page also uses.
 *  Useful for: client-side validators, admin preview, smoke-test scripts.
 *  Returns 404 if the path doesn't match a published row.
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveDestination } from "@/lib/hierarchy";


export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing ?path=" }, { status: 400 });
  }

  const segments = path.split("/").filter(Boolean);
  const dest = await resolveDestination(segments);
  if (!dest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: dest });
}
