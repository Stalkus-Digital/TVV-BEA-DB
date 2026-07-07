/** GET /api/v2/guides/[slug] — single guide + destination. */
import { NextResponse } from "next/server";
import { resolveGuideBySlug } from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const guide = await resolveGuideBySlug(slug);
  if (!guide) return NextResponse.json({ error: "guide_not_found" }, { status: 404 });
  return NextResponse.json(
    { guide },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
