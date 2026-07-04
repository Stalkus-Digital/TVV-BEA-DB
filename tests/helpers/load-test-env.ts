import { config } from "dotenv";
import path from "node:path";

/**
 * Every test entry point (unit, integration, e2e) imports this file first so
 * `.env.test` — not the developer's real `.env` — is what ends up in
 * process.env. `override: true` guarantees this wins even if something else
 * already populated DATABASE_URL from `.env` earlier in the same process.
 * Child processes spawned afterward (test-server.ts's `next start`,
 * Playwright's webServer) inherit this via `env: {...process.env}`, so the
 * override propagates to the real running server too, not just this script.
 */
config({ path: path.resolve(__dirname, "../../.env.test"), override: true });
