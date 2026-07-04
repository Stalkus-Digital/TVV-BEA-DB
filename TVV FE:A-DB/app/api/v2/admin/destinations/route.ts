/**
 * Admin: POST /api/v2/admin/destinations
 *
 *  Create a new destination. Validates:
 *   • Slug shape (DB CHECK also enforces this; we catch earlier for UX)
 *   • Sibling slug uniqueness
 *   • Level matches parent level (REGION→COUNTRY→DESTINATION→SUB_DESTINATION)
 *
 *  Auth: TODO — this is currently open. Once we wire admin auth, gate this
 *  with the same middleware used by the existing /admin/api/* routes.
 *
 *  Busts the public mega-menu cache via revalidateTag on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  hierarchyDb,
  isValidSlug,
  expectedChildLevel,
  findSlugConflict,
  DESTINATION_TREE_TAG,
} from "@/lib/hierarchy";
import type { DestinationLevel, DestinationStatus } from "@/lib/hierarchy";

const LEVEL_DEPTH: Record<DestinationLevel, number> = {
  REGION: 0,
  COUNTRY: 1,
  DESTINATION: 2,
  SUB_DESTINATION: 3,
};

interface CreateBody {
  name: string;
  slug: string;
  level: DestinationLevel;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  gallery?: string[];
  sortOrder?: number;
  status?: DestinationStatus;
  isFeatured?: boolean;
}

export async function POST(req: NextRequest) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.slug || !body.level) {
    return NextResponse.json(
      { error: "name, slug, and level are required" },
      { status: 400 },
    );
  }
  if (!isValidSlug(body.slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase kebab-case (letters, digits, hyphens)" },
      { status: 400 },
    );
  }

  // Parent resolution + level check
  const parentId = body.parentId ? BigInt(body.parentId) : null;
  const parent = parentId
    ? await hierarchyDb.destination.findUnique({
        where: { id: parentId },
        select: { level: true },
      })
    : null;
  if (parentId && !parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  const expected = expectedChildLevel(parent?.level ?? null);
  if (body.level !== expected) {
    return NextResponse.json(
      {
        error: `Wrong level for this parent — expected ${expected ?? "(none, parent is at max depth)"}, got ${body.level}`,
      },
      { status: 400 },
    );
  }

  const conflict = await findSlugConflict(parentId, body.slug);
  if (conflict) {
    return NextResponse.json(
      { error: `A sibling with slug '${body.slug}' already exists (id ${conflict})` },
      { status: 409 },
    );
  }

  const row = await hierarchyDb.destination.create({
    data: {
      name: body.name,
      slug: body.slug,
      slugPath: "", // Trigger overrides.
      level: body.level,
      depth: LEVEL_DEPTH[body.level],
      parentId,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      seoContent: body.seoContent ?? null,
      imageUrl: body.imageUrl ?? null,
      heroImageUrl: body.heroImageUrl ?? null,
      gallery: body.gallery ?? [],
      sortOrder: body.sortOrder ?? 0,
      status: body.status ?? "DRAFT",
      isFeatured: body.isFeatured ?? false,
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidateTag(DESTINATION_TREE_TAG);

  return NextResponse.json({
    data: { ...row, id: row.id.toString(), parentId: row.parentId?.toString() ?? null },
  });
}

/**
 * Admin: GET /api/v2/admin/destinations
 *
 *  Flat list for the admin table. Includes drafts and archived rows.
 *  No cache — admins want to see write-through changes immediately.
 */
export async function GET() {
  const rows = await hierarchyDb.destination.findMany({
    orderBy: [{ depth: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      parentId: true,
      name: true,
      slug: true,
      slugPath: true,
      level: true,
      depth: true,
      status: true,
      isFeatured: true,
      sortOrder: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({
    data: rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      parentId: r.parentId?.toString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}
