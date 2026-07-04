/**
 * GET /api/v2/destinations/[id]/breadcrumbs
 *
 *  Returns the breadcrumb chain (root → leaf) for a destination by id.
 *  Useful when the consumer already has the destination id but doesn't
 *  want to redo the resolver work; e.g. internal admin tooling.
 */

import { NextResponse } from "next/server";
import { hierarchyDb, buildBreadcrumbs } from "@/lib/hierarchy";


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

  const dest = await hierarchyDb.destination.findUnique({
    where: { id: bigId },
    select: { slugPath: true, status: true },
  });
  if (!dest || dest.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const crumbs = await buildBreadcrumbs(dest.slugPath);
  return NextResponse.json({ data: crumbs });
}
