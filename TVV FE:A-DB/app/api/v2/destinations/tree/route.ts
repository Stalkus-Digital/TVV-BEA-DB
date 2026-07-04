/**
 * GET /api/v2/destinations/tree
 *
 *  Returns the full published destination hierarchy (Postgres). Optional on Vercel.
 */

import { NextResponse } from "next/server";
import { getDestinationTree } from "@/lib/hierarchy";
import { isHierarchyEnabled } from "@/lib/hierarchy/enabled";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isHierarchyEnabled()) {
    return NextResponse.json({ data: [] });
  }
  try {
    const tree = await getDestinationTree();
    return NextResponse.json({ data: tree });
  } catch (err) {
    console.error("[v2/destinations/tree]", err);
    return NextResponse.json({ data: [] });
  }
}
