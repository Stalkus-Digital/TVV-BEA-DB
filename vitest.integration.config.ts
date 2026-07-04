import "./tests/helpers/load-test-env";
import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Integration config — boots a real `next start` server once (globalSetup)
 * and every test in this suite hits it over real HTTP via Supertest. Slower
 * than the unit suite by design: this is what actually proves a route
 * handler → service → repository chain works end-to-end, not just that a
 * function returns the right value in isolation. The `next start` process
 * is spawned by test-server.ts with `env: {...process.env}`, so loading
 * `.env.test` here (before that spawn happens) is what makes the real
 * server process run against tvv_travel_os_test instead of the dev
 * database — see docs/24_TEST_DATABASE_LIFECYCLE.md.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    globals: false,
    globalSetup: ["./tests/helpers/global-setup.ts"],
    setupFiles: ["./tests/helpers/test-setup.ts"],
    testTimeout: 15_000,
    hookTimeout: 35_000,
    fileParallelism: false,
  },
});
