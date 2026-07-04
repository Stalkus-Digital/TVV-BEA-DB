import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 removed the schema-level `datasource.url` (and reading
 * DATABASE_URL implicitly at the client-construction site) in favor of an
 * explicit driver adapter — this is the one place that adapter is
 * constructed, so every repository stays unaware of the connection
 * mechanics entirely (same "swap the implementation behind the interface"
 * discipline as Logger/Config/DI).
 *
 * One PrismaClient per process — Fluid Compute reuses function instances
 * across concurrent requests, so a module-level singleton is correct here
 * (never construct a new PrismaClient per request). Cached on `globalThis`
 * so Next.js dev-mode hot-reload doesn't spawn a fresh client (and a fresh
 * connection pool) on every file change.
 *
 * `log: [{ emit: "event", level: "query" }]` (Sprint 15 — Observability
 * Platform) turns on Prisma's own query-event emitter — this is the single
 * choke point every repository across every module already goes through,
 * so it's the only way to get genuine system-wide slow-query tracking
 * without touching a single repository file. Nothing subscribes to the
 * event here; `src/modules/observability/module.ts` attaches the one
 * `prisma.$on("query", ...)` listener as a side effect of being imported,
 * same self-registration convention as every other cross-cutting concern.
 * Emitting the event costs one extra callback per query — it does not
 * change query behavior, transaction semantics, or connection handling.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient<"query"> | undefined;
}

function createPrismaClient(): PrismaClient<"query"> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter, log: [{ emit: "event", level: "query" }] });
}

export const prisma: PrismaClient<"query"> = globalThis.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = prisma;
}
