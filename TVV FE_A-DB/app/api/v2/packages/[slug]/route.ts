/**
 * GET /api/v2/packages/[slug]
 *
 *  Single package with all its eager-loaded relations (destinations,
 *  hotels, categories). Single DB call thanks to Prisma's `include`.
 */

import { NextResponse } from "next/server";
import { resolvePackageBySlug } from "@/lib/hierarchy";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pkg = await resolvePackageBySlug(slug);
  if (!pkg) return NextResponse.json({ error: "package_not_found" }, { status: 404 });
  return NextResponse.json(
    { package: pkg },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
