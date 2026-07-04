import { spawnSync } from "node:child_process";
import path from "node:path";
import { startTestServer } from "../helpers/test-server";

const E2E_PORT = 3940;

/**
 * Playwright's built-in `webServer` option starts the server BEFORE running
 * globalSetup and before any reset/seed happens — that let the server's own
 * per-route module instances race each other seeding the same tables
 * concurrently the moment the first few requests (health check, first spec)
 * landed, causing intermittent "Unique constraint failed" errors and, once,
 * an empty login response body. So `webServer` has been removed from
 * playwright.config.ts entirely; this globalSetup now owns the whole
 * sequence explicitly: reset+seed the database FIRST, THEN start the
 * server, mirroring how tests/helpers/global-setup.ts already does it for
 * the integration suite.
 *
 * The reset+seed step shells out to a `tsx` child process rather than
 * importing reset-test-database.ts directly, because Playwright's own
 * config/globalSetup loader uses a CJS-style transform that can't handle
 * the generated Prisma client's `import.meta` usage.
 */
export default async function globalSetup(): Promise<void> {
  const result = spawnSync(process.execPath, ["./node_modules/.bin/tsx", "tests/helpers/run-reset-and-seed.ts"], {
    cwd: path.resolve(__dirname, "../.."),
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("Test database reset/seed failed before e2e run — see output above.");
  }

  await startTestServer(E2E_PORT);
}
