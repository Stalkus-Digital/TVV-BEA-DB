/**
 * GET /api/v2/destinations/by-slug/[slug]/packages
 *
 *  Packages that include this destination, ordered featured-first.
 *  Returns slim PackageNode shapes — clients hit the detail endpoint
 *  for full info.
 */

import { NextResponse } from "next/server";
import { hierarchyDb, listPackagesForDestination } from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dest = await hierarchyDb.destination.findFirst({
    where: { slug, level: "DESTINATION", status: "PUBLISHED" },
    select: { id: true },
  });
  if (!dest) return NextResponse.json({ error: "destination_not_found" }, { status: 404 });

  const packages = await listPackagesForDestination(dest.id.toString());
  return NextResponse.json(
    { packages },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
