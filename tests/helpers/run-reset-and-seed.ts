import { disconnectTestDatabase, resetAndSeedTestDatabase } from "./reset-test-database";

/**
 * Standalone entry point run via `tsx` in its own child process (see
 * tests/e2e/global-setup.ts) — Playwright's own config/globalSetup loader
 * uses a CJS-style transform that can't handle the generated Prisma
 * client's `import.meta` usage, the same reason prisma/seed.ts is invoked
 * through tsx rather than imported directly.
 */
async function main(): Promise<void> {
  await resetAndSeedTestDatabase();
  await disconnectTestDatabase();
}

main().catch((error) => {
  console.error("Test database reset/seed failed:", error);
  process.exitCode = 1;
});
