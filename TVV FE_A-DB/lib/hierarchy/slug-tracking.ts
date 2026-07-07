/**
 * Slug-change recorder.
 *
 *  Every time an entity (destination, category, hotel, package, guide,
 *  ferry, flight) gets its slug renamed, the admin write-path calls
 *  `recordSlugChange()`. This function:
 *
 *    1. Inserts a row into `slug_history` so the rename trail is preserved.
 *    2. Inserts (or updates) a row in `redirects` so any visitor who hits
 *       the old URL gets a 301 to the new one.
 *
 *  Both writes happen inside a single Postgres transaction. Either both
 *  land or neither does — we never end up with a recorded history but no
 *  live redirect (or vice versa).
 *
 *  CRITICAL INVARIANT
 *  ------------------
 *  This helper must be called *before* committing the entity update,
 *  because we need to know the OLD slug. The recommended pattern is:
 *
 *     await prisma.$transaction(async (tx) => {
 *       const old = await tx.destination.findUnique({ where: { id } });
 *       const updated = await tx.destination.update({ where: { id }, data });
 *       if (old.slug !== updated.slug) {
 *         await recordSlugChange(tx, {
 *           entityType: 'DESTINATION', entityId: id,
 *           oldSlug: old.slug, oldFullPath: '/...', newFullPath: '/...',
 *           changedByUser, reason,
 *         });
 *       }
 *     });
 *
 *  CASCADING
 *  ---------
 *  Renaming a parent (e.g. a country slug) also renames the URLs of every
 *  descendant. We DON'T enumerate the subtree here — that's the caller's
 *  job, because each entity type's path is computed differently. The
 *  caller passes the new full path it computed.
 */

import type { Prisma, SluggableEntity } from "./generated";
import { hierarchyDb } from "./db";
import { bustRedirectCache } from "./redirects";

export interface SlugChangeInput {
  entityType: SluggableEntity;
  entityId: bigint;
  /** The slug *segment* the entity used to have (e.g. "best-hotels"). */
  oldSlug: string;
  /** Full canonical path before the rename (e.g. "/india/andaman/best-hotels"). */
  oldFullPath: string;
  /** Full canonical path after the rename (e.g. "/india/andaman/luxury-hotels"). */
  newFullPath: string;
  /** Username/email of the admin who triggered the change. Optional. */
  changedByUser?: string;
  /** Free-text note ("rebranding", "typo fix", "campaign cleanup"). */
  reason?: string;
  /** Locale this rename applies to. Defaults to "en". */
  locale?: string;
}

/**
 * Atomically record a slug change + ensure a redirect exists.
 *
 * Accepts either a transaction client (for callers that already have one
 * open — strongly preferred) or `null` to run a standalone transaction.
 */
export async function recordSlugChange(
  client: Prisma.TransactionClient | null,
  input: SlugChangeInput,
): Promise<void> {
  if (input.oldFullPath === input.newFullPath) return; // no-op

  const run = async (tx: Prisma.TransactionClient) => {
    // 1. Append to history. Never deletes prior history rows even on
    //    repeat renames — we want the full trail.
    await tx.slugHistory.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        locale: input.locale ?? "en",
        oldSlug: input.oldSlug,
        oldFullPath: input.oldFullPath,
        newFullPath: input.newFullPath,
        changedByUser: input.changedByUser ?? null,
        reason: input.reason ?? null,
      },
    });

    // 2. Upsert the redirect. If someone already had a manual redirect
    //    from this path (e.g. campaign rule), we OVERWRITE it because the
    //    slug-rename is authoritative — anything pointing at the dead URL
    //    must now follow the rename. The previous redirect intent is
    //    preserved by `source = SLUG_HISTORY`.
    //
    //    No-op if the target already matches (idempotent on retry).
    await tx.redirect.upsert({
      where: { fromPath: input.oldFullPath },
      create: {
        fromPath: input.oldFullPath,
        toPath: input.newFullPath,
        statusCode: 301,
        source: "SLUG_HISTORY",
        reason: input.reason ?? `Slug renamed (${input.entityType.toLowerCase()} #${input.entityId})`,
        locale: input.locale ?? null,
        isActive: true,
      },
      update: {
        toPath: input.newFullPath,
        source: "SLUG_HISTORY",
        isActive: true,
        reason: input.reason ?? `Slug renamed (${input.entityType.toLowerCase()} #${input.entityId})`,
      },
    });

    // 3. If the NEW path is itself in the redirects table (someone
    //    previously renamed the destination *to* what we're now using),
    //    deactivate that row — it would create a redirect chain
    //    A → B → A or a loop.
    await tx.redirect.updateMany({
      where: { fromPath: input.newFullPath },
      data: { isActive: false, reason: "Deactivated: target is now a live URL" },
    });
  };

  if (client) {
    await run(client);
  } else {
    await hierarchyDb.$transaction(run);
  }

  // Bust the in-memory redirect map so the next request picks up the change.
  bustRedirectCache();
}

/**
 * History reader — what was this entity ever called?
 * Useful for the admin's "URL history" panel.
 */
export async function getSlugHistoryForEntity(
  entityType: SluggableEntity,
  entityId: bigint,
  locale: string = "en",
) {
  return hierarchyDb.slugHistory.findMany({
    where: { entityType, entityId, locale },
    orderBy: { changedAt: "desc" },
  });
}
