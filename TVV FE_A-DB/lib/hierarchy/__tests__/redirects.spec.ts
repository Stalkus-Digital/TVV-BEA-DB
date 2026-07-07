/**
 * Standalone integration test for the SEO redirect engine.
 *
 *  Runs against the live `tvv_hierarchy` Postgres DB using the same
 *  Prisma client as the catch-all page. No test runner — just `tsx`.
 *
 *  Usage:
 *    npm run hierarchy:test-redirects
 *
 *  Each case isolates its fixtures with the `/__test__/...` path
 *  prefix and cleans them up at exit (including on assertion failure).
 *  Exits 0 on success, 1 on any failed assertion.
 */

import { hierarchyDb } from "../db";
import { lookupRedirect, bustRedirectCache } from "../redirects";
import { recordSlugChange } from "../slug-tracking";

const TEST_PREFIX = "/__test__/";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertEqual<T>(label: string, actual: T, expected: T) {
  // JSON-string compare to handle objects/arrays safely.
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    console.log(`    expected: ${e}`);
    console.log(`    actual:   ${a}`);
    failed++;
    failures.push(label);
  }
}

async function cleanup() {
  await hierarchyDb.redirect.deleteMany({
    where: { fromPath: { startsWith: TEST_PREFIX } },
  });
  await hierarchyDb.slugHistory.deleteMany({
    where: { oldFullPath: { startsWith: TEST_PREFIX } },
  });
  bustRedirectCache();
}

async function test(label: string, fn: () => Promise<void>) {
  console.log(`\n• ${label}`);
  try {
    await cleanup();
    await fn();
  } catch (e) {
    console.log(`  ✗ THREW: ${(e as Error).message}`);
    failed++;
    failures.push(label);
  } finally {
    await cleanup();
  }
}

async function main() {
  console.log("Redirect engine — integration tests against tvv_hierarchy");

  // ─── lookupRedirect ─────────────────────────────────────────────────────

  await test("returns null when no redirect exists", async () => {
    const hit = await lookupRedirect(`${TEST_PREFIX}does-not-exist`);
    assertEqual("hit is null", hit, null);
  });

  await test("returns the direct hop for A → B", async () => {
    await hierarchyDb.redirect.create({
      data: {
        fromPath: `${TEST_PREFIX}old-page`,
        toPath: `${TEST_PREFIX}new-page`,
        statusCode: 301,
        source: "MANUAL",
        isActive: true,
      },
    });
    bustRedirectCache();

    const hit = await lookupRedirect(`${TEST_PREFIX}old-page`);
    assertEqual("hit.toPath", hit?.toPath, `${TEST_PREFIX}new-page`);
    assertEqual("hit.statusCode", hit?.statusCode, 301);
  });

  await test("follows transitive chain A → B → C", async () => {
    await hierarchyDb.redirect.createMany({
      data: [
        {
          fromPath: `${TEST_PREFIX}chain-a`,
          toPath: `${TEST_PREFIX}chain-b`,
          statusCode: 301,
          source: "MANUAL",
        },
        {
          fromPath: `${TEST_PREFIX}chain-b`,
          toPath: `${TEST_PREFIX}chain-c`,
          statusCode: 301,
          source: "MANUAL",
        },
      ],
    });
    bustRedirectCache();

    const hit = await lookupRedirect(`${TEST_PREFIX}chain-a`);
    assertEqual("hit.toPath (final)", hit?.toPath, `${TEST_PREFIX}chain-c`);
  });

  await test("detects cycles and returns null", async () => {
    await hierarchyDb.redirect.createMany({
      data: [
        {
          fromPath: `${TEST_PREFIX}cycle-a`,
          toPath: `${TEST_PREFIX}cycle-b`,
          statusCode: 301,
          source: "MANUAL",
        },
        {
          fromPath: `${TEST_PREFIX}cycle-b`,
          toPath: `${TEST_PREFIX}cycle-a`,
          statusCode: 301,
          source: "MANUAL",
        },
      ],
    });
    bustRedirectCache();

    const hit = await lookupRedirect(`${TEST_PREFIX}cycle-a`);
    assertEqual("hit on cycle is null", hit, null);
  });

  await test("ignores inactive redirects", async () => {
    await hierarchyDb.redirect.create({
      data: {
        fromPath: `${TEST_PREFIX}disabled`,
        toPath: `${TEST_PREFIX}target`,
        statusCode: 301,
        source: "MANUAL",
        isActive: false,
      },
    });
    bustRedirectCache();

    const hit = await lookupRedirect(`${TEST_PREFIX}disabled`);
    assertEqual("hit is null", hit, null);
  });

  await test("preserves the final hop's status code through the chain", async () => {
    await hierarchyDb.redirect.createMany({
      data: [
        {
          fromPath: `${TEST_PREFIX}temp-redirect`,
          toPath: `${TEST_PREFIX}intermediate`,
          statusCode: 307,
          source: "MANUAL",
        },
        {
          fromPath: `${TEST_PREFIX}intermediate`,
          toPath: `${TEST_PREFIX}final`,
          statusCode: 301,
          source: "MANUAL",
        },
      ],
    });
    bustRedirectCache();

    const hit = await lookupRedirect(`${TEST_PREFIX}temp-redirect`);
    assertEqual("toPath = final", hit?.toPath, `${TEST_PREFIX}final`);
    assertEqual("statusCode = last hop (301)", hit?.statusCode, 301);
  });

  // ─── recordSlugChange ───────────────────────────────────────────────────

  await test("writes a history row and an auto-redirect atomically", async () => {
    const entityId = BigInt(999_999_001);

    await recordSlugChange(null, {
      entityType: "DESTINATION",
      entityId,
      oldSlug: "old-slug",
      oldFullPath: `${TEST_PREFIX}history-old`,
      newFullPath: `${TEST_PREFIX}history-new`,
      reason: "test fixture",
    });

    const history = await hierarchyDb.slugHistory.findFirst({
      where: { oldFullPath: `${TEST_PREFIX}history-old` },
    });
    assertEqual("history row exists", !!history, true);
    assertEqual("history.newFullPath", history?.newFullPath, `${TEST_PREFIX}history-new`);

    const hit = await lookupRedirect(`${TEST_PREFIX}history-old`);
    assertEqual("auto-redirect toPath", hit?.toPath, `${TEST_PREFIX}history-new`);
    assertEqual("auto-redirect status", hit?.statusCode, 301);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });

  await test("re-recording updates redirect target (not duplicates)", async () => {
    const entityId = BigInt(999_999_002);

    await recordSlugChange(null, {
      entityType: "HOTEL",
      entityId,
      oldSlug: "test-hotel",
      oldFullPath: `${TEST_PREFIX}idempotent-old`,
      newFullPath: `${TEST_PREFIX}idempotent-new-v1`,
    });
    await recordSlugChange(null, {
      entityType: "HOTEL",
      entityId,
      oldSlug: "test-hotel",
      oldFullPath: `${TEST_PREFIX}idempotent-old`,
      newFullPath: `${TEST_PREFIX}idempotent-new-v2`,
    });

    const redirects = await hierarchyDb.redirect.findMany({
      where: { fromPath: `${TEST_PREFIX}idempotent-old` },
    });
    assertEqual("only one redirect row", redirects.length, 1);
    assertEqual("target updated to v2", redirects[0]?.toPath, `${TEST_PREFIX}idempotent-new-v2`);

    const history = await hierarchyDb.slugHistory.findMany({
      where: { entityId },
    });
    assertEqual("two history rows (audit)", history.length, 2);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });

  await test("deactivates A → B if rename creates B (no loops)", async () => {
    const entityId = BigInt(999_999_003);

    await hierarchyDb.redirect.create({
      data: {
        fromPath: `${TEST_PREFIX}path-b`,
        toPath: `${TEST_PREFIX}path-a`,
        statusCode: 301,
        source: "MANUAL",
        isActive: true,
      },
    });

    await recordSlugChange(null, {
      entityType: "PACKAGE",
      entityId,
      oldSlug: "path-a",
      oldFullPath: `${TEST_PREFIX}path-a`,
      newFullPath: `${TEST_PREFIX}path-b`,
    });

    const oldRedirect = await hierarchyDb.redirect.findUnique({
      where: { fromPath: `${TEST_PREFIX}path-b` },
    });
    assertEqual("old B→A redirect deactivated", oldRedirect?.isActive, false);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log("\n────────────────────────────────────────");
  console.log(`Passed: ${passed}    Failed: ${failed}`);
  if (failed > 0) {
    console.log("Failed cases:");
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log("────────────────────────────────────────");

  await hierarchyDb.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error("Test harness crashed:", e);
  await hierarchyDb.$disconnect();
  process.exit(1);
});
