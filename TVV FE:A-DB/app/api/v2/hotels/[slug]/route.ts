/** GET /api/v2/hotels/[slug] — single hotel + destination. */
import { NextResponse } from "next/server";
import { resolveHotelBySlug } from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const hotel = await resolveHotelBySlug(slug);
  if (!hotel) return NextResponse.json({ error: "hotel_not_found" }, { status: 404 });
  return NextResponse.json(
    { hotel },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
