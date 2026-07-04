import "./load-test-env";
import { disconnectTestDatabase, resetAndSeedTestDatabase, resetTestDatabase } from "./reset-test-database";
import { startTestServer, stopTestServer } from "./test-server";

/**
 * Reset-then-seed happens before the server is spawned so the process that
 * boots (test-server.ts) always sees a clean, freshly-seeded database on
 * its first request — regardless of whatever earlier run left behind.
 */
export async function setup(): Promise<void> {
  await resetAndSeedTestDatabase();
  await startTestServer();
}

export async function teardown(): Promise<void> {
  await stopTestServer();
  await resetTestDatabase();
  await disconnectTestDatabase();
}
