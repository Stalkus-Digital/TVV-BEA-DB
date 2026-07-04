import "./load-test-env";
import { prisma } from "../../src/shared/database/prisma-client";

/**
 * Hard safety guard against ever truncating anything but the dedicated test
 * database — this function is destructive (TRUNCATE ... CASCADE on every
 * table), so a mistaken DATABASE_URL here would wipe real dev data
 * (tvv_travel_os) or, worse, the legacy tvv_hierarchy database. Every path
 * into resetTestDatabase() must go through this check first.
 */
function assertIsTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!/\/tvv_travel_os_test(\?|$)/.test(url)) {
    throw new Error(
      `Refusing to reset: DATABASE_URL does not point at tvv_travel_os_test. ` +
        `Got: ${url || "(unset)"}. Did load-test-env.ts run before this call?`
    );
  }
}

/**
 * Deterministic reset between test suite runs — TRUNCATE, not per-row
 * delete, so it's fast and resets identity sequences too. Table list is
 * read from pg_tables rather than hardcoded so it never drifts out of sync
 * with schema.prisma as models are added.
 */
export async function resetTestDatabase(): Promise<void> {
  assertIsTestDatabase();
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;
  if (tables.length === 0) return;
  const list = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

/**
 * Reset followed by a fresh seed. The `@/modules/auth` import is deferred
 * (dynamic, not static) and only happens AFTER resetTestDatabase() resolves:
 * module.ts fires an unconditional `void ensureAuthModuleSeeded()` the
 * instant it's imported, and ensureAuthModuleSeeded()'s result is cached for
 * the lifetime of the process. A static top-level import here would start
 * that auto-seed immediately on import — racing with the truncate a few
 * lines later — and once the promise resolves once, no later call in this
 * process can ever make it re-seed. Importing only after the truncate
 * guarantees the auto-seed (and our own explicit call, which just reuses
 * the same cached promise) both run against an already-empty database.
 */
export async function resetAndSeedTestDatabase(): Promise<void> {
  await resetTestDatabase();
  const { ensureAuthModuleSeeded } = await import("../../src/modules/auth");
  await ensureAuthModuleSeeded();
}

/**
 * Closes the shared Prisma connection pool. Call this once at the very end
 * of a suite's teardown (after any final resetTestDatabase() call) — without
 * it, Vitest/Node has an open TCP connection keeping the process alive and
 * "close timed out" warnings appear even though every test passed.
 */
export async function disconnectTestDatabase(): Promise<void> {
  await prisma.$disconnect();
}
