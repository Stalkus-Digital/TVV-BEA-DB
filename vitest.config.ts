import "./tests/helpers/load-test-env";
import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Unit config — no server, no network. Every test here imports a service/
 * pure function directly; some go through the real DI container, which
 * (since Sprint 12) resolves real Prisma-backed repositories rather than an
 * in-memory substitute — see docs/24_TEST_DATABASE_LIFECYCLE.md. That's why
 * this config, unlike a purely in-memory unit suite, still needs its own
 * isolated database and sequential file execution (fileParallelism: false):
 * with a real shared Postgres instance behind every parallel test file,
 * count-based sequence generation (e.g. quote numbers) and fixed-title
 * fixtures would otherwise race or collide across files.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globals: false,
    globalSetup: ["./tests/helpers/global-setup.unit.ts"],
    setupFiles: ["./tests/helpers/test-setup.unit.ts"],
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/shared/**", "src/modules/**", "src/api/**"],
      exclude: ["src/modules/**/index.ts", "src/modules/**/module.ts", "src/**/*.d.ts"],
    },
  },
});
