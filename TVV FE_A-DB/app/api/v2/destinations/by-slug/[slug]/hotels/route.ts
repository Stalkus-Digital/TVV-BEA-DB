/** GET /api/v2/destinations/by-slug/[slug]/hotels — hotels in this destination. */
import { NextResponse } from "next/server";
import { hierarchyDb, listHotelsForDestination } from "@/lib/hierarchy";


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

  const hotels = await listHotelsForDestination(dest.id.toString());
  return NextResponse.json(
    { hotels },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
