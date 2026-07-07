/**
 * Admin-side write validation.
 *
 *  The public reader doesn't need these — `slug_path` uniqueness + the DB
 *  CHECK constraints already make invalid hierarchies structurally
 *  impossible at read time. But for the admin form, we want to reject the
 *  request BEFORE it hits the DB and emits a confusing constraint error.
 *
 *  Three checks here:
 *
 *   1. `isLegalLevelChange` — REGION → COUNTRY → DESTINATION → SUB_DESTINATION,
 *      depth = parent.depth + 1. Anything else violates `depth_matches_level`.
 *
 *   2. `isLegalParent` — when moving a subtree, the new parent must not be a
 *      descendant of the node being moved (would create a cycle and lock the
 *      tree). Uses a small recursive CTE to walk up from the proposed parent.
 *
 *   3. `findSlugConflict` — sibling slugs are unique. Pre-checking lets the
 *      admin see a nice error ("a child with slug 'india' already exists
 *      under this region") instead of a Prisma P2002.
 */

import { hierarchyDb } from "./db";
import type { DestinationLevel } from "./generated";

const LEVEL_ORDER: Record<DestinationLevel, number> = {
  REGION: 0,
  COUNTRY: 1,
  DESTINATION: 2,
  SUB_DESTINATION: 3,
};

/**
 * The level a child of `parentLevel` must occupy. Returns null if parentLevel
 * is already at the bottom (SUB_DESTINATION cannot have children).
 */
export function expectedChildLevel(
  parentLevel: DestinationLevel | null,
): DestinationLevel | null {
  if (parentLevel === null) return "REGION";
  switch (parentLevel) {
    case "REGION": return "COUNTRY";
    case "COUNTRY": return "DESTINATION";
    case "DESTINATION": return "SUB_DESTINATION";
    case "SUB_DESTINATION": return null;
  }
}

export function isLegalLevelChange(
  parentLevel: DestinationLevel | null,
  childLevel: DestinationLevel,
): boolean {
  return expectedChildLevel(parentLevel) === childLevel;
}

/**
 * Walk up from `proposedParentId`; if `childId` appears anywhere on that path,
 * moving `childId` under `proposedParentId` would create a cycle. Returns
 * true if the move is legal.
 *
 * Single recursive CTE — Postgres executes it in one round-trip.
 */
export async function isLegalParent(
  childId: bigint,
  proposedParentId: bigint | null,
): Promise<boolean> {
  if (proposedParentId === null) return true;
  if (proposedParentId === childId) return false;

  const conflict = await hierarchyDb.$queryRaw<{ id: bigint }[]>`
    WITH RECURSIVE up AS (
      SELECT id, parent_id FROM destinations WHERE id = ${proposedParentId}
      UNION ALL
      SELECT d.id, d.parent_id FROM destinations d
        JOIN up ON d.id = up.parent_id
    )
    SELECT id FROM up WHERE id = ${childId} LIMIT 1;
  `;
  return conflict.length === 0;
}

/**
 * Sibling slug collision check. Returns the conflicting destination's id if
 * one exists, otherwise null. Pass `excludeId` when editing an existing row
 * so it doesn't conflict with itself.
 */
export async function findSlugConflict(
  parentId: bigint | null,
  slug: string,
  excludeId?: bigint,
): Promise<string | null> {
  const conflict = await hierarchyDb.destination.findFirst({
    where: {
      parentId,
      slug,
      id: excludeId !== undefined ? { not: excludeId } : undefined,
    },
    select: { id: true },
  });
  return conflict ? conflict.id.toString() : null;
}
