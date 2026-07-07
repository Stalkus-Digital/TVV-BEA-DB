/**
 * Prisma client singleton for the destination hierarchy DB.
 *
 *  Why a singleton?  Next.js dev mode hot-reloads modules on every save;
 *  without this guard you accumulate connections and eventually hit
 *  Postgres' default max_connections=100 cap.
 *
 *  Why a separate client?  The legacy Mongo client (used by every other
 *  domain) is regenerated from `apps/api/prisma/schema.prisma`. This hierarchy
 *  client is regenerated from `tvv 2/prisma-hierarchy/schema.prisma` into a
 *  local folder (`lib/hierarchy/generated`) so the two never collide. Each
 *  client only knows about its own models.
 *
 *  IMPORT THIS, NOT `@prisma/client` DIRECTLY — the type you get from this
 *  file is the hierarchy-specific PrismaClient, with the `Destination` and
 *  `DestinationTranslation` models on it. The global `@prisma/client` import
 *  resolves to whichever client `prisma generate` ran last, which is unsafe.
 */

import { PrismaClient } from "./generated";

declare global {
  // eslint-disable-next-line no-var
  var __hierarchyPrisma: PrismaClient | undefined;
}

export const hierarchyDb: PrismaClient =
  globalThis.__hierarchyPrisma ??
  new PrismaClient({
    // Log SQL in dev so the developer can see exactly which queries the
    // resolver/tree fetcher fire. Silenced in production.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__hierarchyPrisma = hierarchyDb;
}
