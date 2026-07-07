/**
 * GET /api/navigation/tree
 *
 *  Returns the public navigation tree rooted at COUNTRY, with destinations
 *  and categories nested. Optional until Postgres hierarchy is provisioned.
 */

import { NextResponse } from "next/server";
import { getNavigationTree } from "@/lib/hierarchy";
import { isHierarchyEnabled } from "@/lib/hierarchy/enabled";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isHierarchyEnabled()) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  try {
    const tree = await getNavigationTree();
    return NextResponse.json(tree, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[navigation/tree]", err);
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
