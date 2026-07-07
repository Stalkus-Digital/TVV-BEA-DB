/**
 * Vitest configuration — runs against the live Postgres `tvv_hierarchy`
 * database. Tests are responsible for isolating their fixtures (using
 * the `__test__` slug prefix convention) and cleaning up in `afterEach`.
 *
 * Path-alias `@/*` mirrors tsconfig so test imports look the same as
 * production imports.
 */
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    // The redirect cache lives in module state. Each test file gets a
    // fresh worker so cross-file leakage doesn't happen.
    isolate: true,
    // Postgres I/O makes these slower than typical unit tests, but
    // they still run sub-second per case.
    testTimeout: 10_000,
  },
});
