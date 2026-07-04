/**
 * GET /api/v2/destinations/by-slug/[slug]
 *
 *  Returns the DESTINATION-level row whose slug matches, plus the
 *  related-content bundle (hotels, packages, guides, ferries, flights).
 *
 *  Lookup is by leaf slug only (not slugPath) — that's the natural
 *  identifier for a third-party client and matches the spec's
 *  `GET /destinations/:slug`. Two destinations with the same slug
 *  under different countries are theoretically allowed by the schema
 *  but are not allowed in practice (admin write-time validation). If
 *  one ever sneaks through, this endpoint returns the first match.
 */

import { NextResponse } from "next/server";
import {
  hierarchyDb,
  fetchDestinationRelatedContent,
} from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const dest = await hierarchyDb.destination.findFirst({
    where: { slug, level: "DESTINATION", status: "PUBLISHED" },
  });
  if (!dest) {
    return NextResponse.json({ error: "destination_not_found" }, { status: 404 });
  }

  const related = await fetchDestinationRelatedContent(dest.id.toString());

  return NextResponse.json(
    {
      destination: {
        id: dest.id.toString(),
        parentId: dest.parentId?.toString() ?? null,
        name: dest.name,
        slug: dest.slug,
        slugPath: dest.slugPath,
        level: dest.level,
        depth: dest.depth,
        metaTitle: dest.metaTitle,
        metaDescription: dest.metaDescription,
        heroImageUrl: dest.heroImageUrl,
        imageUrl: dest.imageUrl,
        isFeatured: dest.isFeatured,
      },
      related,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
