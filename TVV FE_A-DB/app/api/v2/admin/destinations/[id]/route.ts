/**
 * Admin per-destination handlers:
 *
 *   GET    /api/v2/admin/destinations/[id]    — full row, drafts included
 *   PATCH  /api/v2/admin/destinations/[id]    — partial update
 *   DELETE /api/v2/admin/destinations/[id]    — soft delete (status=ARCHIVED)
 *
 *  PATCH can change `parentId` (move the subtree) — runs the cycle guard
 *  via `isLegalParent` before allowing it. The slug_path cascade is
 *  handled by the DB trigger and walks every descendant in one statement.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  hierarchyDb,
  isLegalParent,
  expectedChildLevel,
  findSlugConflict,
  isValidSlug,
  recordSlugChange,
  DESTINATION_TREE_TAG,
} from "@/lib/hierarchy";
import type { DestinationLevel, DestinationStatus } from "@/lib/hierarchy";

/**
 * Convert a destination's `slugPath` (e.g. "asia-pacific/india/andaman")
 * into the PUBLIC URL path (e.g. "/india/andaman"). REGION segments are
 * stripped because the public URL surface starts at COUNTRY.
 *
 * For SUB_DESTINATION-level rows, the public surface doesn't exist yet —
 * we return null and skip slug-history recording for those.
 */
function slugPathToPublicUrl(slugPath: string, level: DestinationLevel): string | null {
  const parts = slugPath.split("/");
  switch (level) {
    case "REGION":
      return null;            // regions don't have a public URL surface
    case "COUNTRY":
      return `/${parts[parts.length - 1]}`;
    case "DESTINATION":
      return `/${parts.slice(-2).join("/")}`;
    case "SUB_DESTINATION":
      return null;            // sub-destinations not in public URL surface yet
  }
}

const LEVEL_DEPTH: Record<DestinationLevel, number> = {
  REGION: 0,
  COUNTRY: 1,
  DESTINATION: 2,
  SUB_DESTINATION: 3,
};

function toBigInt(id: string): bigint | null {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const bigId = toBigInt(id);
  if (!bigId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const row = await hierarchyDb.destination.findUnique({ where: { id: bigId } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      ...row,
      id: row.id.toString(),
      parentId: row.parentId?.toString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
    },
  });
}

interface PatchBody {
  name?: string;
  slug?: string;
  level?: DestinationLevel;
  parentId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  seoContent?: string | null;
  imageUrl?: string | null;
  heroImageUrl?: string | null;
  gallery?: string[];
  sortOrder?: number;
  status?: DestinationStatus;
  isFeatured?: boolean;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const bigId = toBigInt(id);
  if (!bigId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await hierarchyDb.destination.findUnique({ where: { id: bigId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Slug shape check
  if (body.slug !== undefined && !isValidSlug(body.slug)) {
    return NextResponse.json({ error: "Invalid slug shape" }, { status: 400 });
  }

  // Move check: ensure the new parent isn't a descendant (no cycles).
  let newParentId: bigint | null | undefined = undefined;
  if (body.parentId !== undefined) {
    newParentId = body.parentId === null ? null : toBigInt(body.parentId);
    if (body.parentId !== null && newParentId === null) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
    }
    const legal = await isLegalParent(bigId, newParentId);
    if (!legal) {
      return NextResponse.json(
        { error: "Moving here would create a cycle in the hierarchy" },
        { status: 409 },
      );
    }
  }

  // Level check: if level is changing OR parent is changing, re-validate.
  const nextLevel = body.level ?? current.level;
  const effectiveParentId = newParentId === undefined ? current.parentId : newParentId;
  if (body.level !== undefined || body.parentId !== undefined) {
    const parent = effectiveParentId
      ? await hierarchyDb.destination.findUnique({
          where: { id: effectiveParentId },
          select: { level: true },
        })
      : null;
    const expected = expectedChildLevel(parent?.level ?? null);
    if (nextLevel !== expected) {
      return NextResponse.json(
        { error: `Level ${nextLevel} not legal under parent — expected ${expected}` },
        { status: 400 },
      );
    }
  }

  // Sibling slug uniqueness re-check when slug or parent changes.
  if (body.slug !== undefined || body.parentId !== undefined) {
    const conflict = await findSlugConflict(effectiveParentId, body.slug ?? current.slug, bigId);
    if (conflict) {
      return NextResponse.json(
        { error: `Sibling with that slug already exists (id ${conflict})` },
        { status: 409 },
      );
    }
  }

  // Run the update + slug-history record inside a single transaction so we
  // never end up with a renamed entity that has no redirect from its old
  // URL (or vice versa). The DB trigger rebuilds slug_path automatically,
  // so we sample it INSIDE the transaction both before and after the update
  // to compute the public URL change.
  const slugChanging = body.slug !== undefined && body.slug !== current.slug;
  const parentChanging = body.parentId !== undefined && newParentId !== current.parentId;

  const updated = await hierarchyDb.$transaction(async (tx) => {
    const next = await tx.destination.update({
      where: { id: bigId },
      data: {
        name: body.name ?? undefined,
        slug: body.slug ?? undefined,
        level: body.level ?? undefined,
        depth: body.level !== undefined ? LEVEL_DEPTH[body.level] : undefined,
        parentId: newParentId,
        metaTitle: body.metaTitle === undefined ? undefined : body.metaTitle,
        metaDescription: body.metaDescription === undefined ? undefined : body.metaDescription,
        seoContent: body.seoContent === undefined ? undefined : body.seoContent,
        imageUrl: body.imageUrl === undefined ? undefined : body.imageUrl,
        heroImageUrl: body.heroImageUrl === undefined ? undefined : body.heroImageUrl,
        gallery: body.gallery ?? undefined,
        sortOrder: body.sortOrder ?? undefined,
        status: body.status ?? undefined,
        isFeatured: body.isFeatured ?? undefined,
        publishedAt:
          body.status === "PUBLISHED" && current.status !== "PUBLISHED"
            ? new Date()
            : undefined,
      },
    });

    // If the slug (or parent, which changes the URL) changed, log it.
    //
    // FOLLOW-UP: when a parent's slug changes, descendant public URLs
    // also change because they include the parent's segment. The DB
    // trigger updates their slug_path automatically, but we don't yet
    // walk the subtree here to record per-descendant slug history.
    // For full SEO preservation on parent renames, enumerate descendants
    // and record one history row per affected level. Tracked as a known
    // gap; for a leaf-only rename (the common case) this is fine.
    if (slugChanging || parentChanging) {
      const oldPublicUrl = slugPathToPublicUrl(current.slugPath, current.level);
      const newPublicUrl = slugPathToPublicUrl(next.slugPath, next.level);
      if (oldPublicUrl && newPublicUrl && oldPublicUrl !== newPublicUrl) {
        await recordSlugChange(tx, {
          entityType: "DESTINATION",
          entityId: bigId,
          oldSlug: current.slug,
          oldFullPath: oldPublicUrl,
          newFullPath: newPublicUrl,
          reason: slugChanging ? "Slug renamed" : "Moved to new parent",
        });
      }
    }

    return next;
  });

  revalidateTag(DESTINATION_TREE_TAG);

  return NextResponse.json({
    data: {
      ...updated,
      id: updated.id.toString(),
      parentId: updated.parentId?.toString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      publishedAt: updated.publishedAt?.toISOString() ?? null,
    },
  });
}

/**
 * Soft delete. We flip status to ARCHIVED rather than truly removing rows
 * because downstream domain tables (packages, hotels, bookings) FK into us;
 * a hard delete would either cascade through transactional history or be
 * blocked by ON DELETE RESTRICT. Archive preserves the audit trail.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const bigId = toBigInt(id);
  if (!bigId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const archived = await hierarchyDb.destination.update({
    where: { id: bigId },
    data: { status: "ARCHIVED" },
  });

  revalidateTag(DESTINATION_TREE_TAG);

  return NextResponse.json({
    data: { id: archived.id.toString(), status: archived.status },
  });
}
