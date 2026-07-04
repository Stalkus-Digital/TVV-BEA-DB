import "./tests/helpers/load-test-env";
import { defineConfig } from "@playwright/test";

/**
 * No admin UI exists yet against this backend (still blocked on the open
 * `src/modules/*` UI-placement gap — see CLAUDE.md's Approved Folder
 * Architecture section). "E2E" here means Playwright's `request` API-testing
 * fixture driving full, real, cross-module business flows over HTTP against
 * a real running server — country → destination → package → quote →
 * booking, exactly like every sprint's manual `curl` verification did, now
 * automated. This is a deliberate scope decision, not a placeholder: when a
 * real admin UI is built, `use: { baseURL, ... }` browser-based specs are
 * additive here, not a rewrite of this config.
 *
 * `.env.test` is loaded above so DATABASE_URL points at tvv_travel_os_test
 * everywhere in this process — see docs/24_TEST_DATABASE_LIFECYCLE.md.
 *
 * There is no `webServer` option here on purpose: Playwright starts
 * `webServer` before running globalSetup, which meant the server used to
 * boot (and race its own per-route auto-seed) before the database had been
 * reset/seeded. tests/e2e/global-setup.ts now owns the whole sequence
 * itself — reset+seed, then start the server — and
 * tests/e2e/global-teardown.ts stops it afterward.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3940",
    extraHTTPHeaders: { "Content-Type": "application/json" },
  },
});
