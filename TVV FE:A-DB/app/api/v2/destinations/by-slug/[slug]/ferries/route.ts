/** GET /api/v2/destinations/by-slug/[slug]/ferries — ferry routes serving this destination. */
import { NextResponse } from "next/server";
import { hierarchyDb, listFerryRoutesForDestination } from "@/lib/hierarchy";


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

  const ferries = await listFerryRoutesForDestination(dest.id.toString());
  return NextResponse.json(
    { ferries },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
