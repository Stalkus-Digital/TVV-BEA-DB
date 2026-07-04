import { disconnectTestDatabase, resetAndSeedTestDatabase, resetTestDatabase } from "./reset-test-database";

/**
 * Unit tests call getXService() directly, which resolves real
 * Prisma-backed repositories through the DI container (not an in-memory
 * substitute) — see CLAUDE.md's Sprint 12 notes. That means this suite
 * needs the same clean-slate guarantee integration/e2e get: reset once
 * before the run, and once more after so nothing lingers for whatever
 * runs next against this database.
 */
export async function setup(): Promise<void> {
  await resetAndSeedTestDatabase();
}

export async function teardown(): Promise<void> {
  await resetTestDatabase();
  await disconnectTestDatabase();
}
