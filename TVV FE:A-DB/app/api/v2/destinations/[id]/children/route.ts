/**
 * GET /api/v2/destinations/[id]/children
 *
 *  One level down. The catch-all page uses this to render the "drill into"
 *  grid when a user lands on a non-leaf node (e.g. /destinations-v2/asia-pacific
 *  should show India + future countries as cards).
 */

import { NextResponse } from "next/server";
import { hierarchyDb } from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let bigId: bigint;
  try {
    bigId = BigInt(id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const children = await hierarchyDb.destination.findMany({
    where: { parentId: bigId, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      parentId: true,
      name: true,
      slug: true,
      slugPath: true,
      level: true,
      depth: true,
      imageUrl: true,
      heroImageUrl: true,
      sortOrder: true,
    },
  });

  return NextResponse.json({
    data: children.map((c) => ({
      ...c,
      id: c.id.toString(),
      parentId: c.parentId?.toString() ?? null,
    })),
  });
}
