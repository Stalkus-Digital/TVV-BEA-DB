/**
 * Integration tests for the SEO redirect engine.
 *
 *  These run against the live `tvv_hierarchy` Postgres DB (see
 *  HIERARCHY_DATABASE_URL in .env). They use a "__test__/..." path
 *  prefix for every fixture so they're trivially distinguishable from
 *  real seed data, and clean themselves up in afterEach.
 *
 *  WHY HIT THE REAL DB?
 *  The whole point of the engine is to talk to Postgres and resolve a
 *  chain through the same Prisma client the catch-all uses. Mocking
 *  Prisma would test our chain-resolution loop but skip the integration
 *  layer that actually moves data — which is where the dev-mode bugs
 *  we saw with `unstable_cache` lived.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hierarchyDb } from "../db";
import { lookupRedirect, bustRedirectCache } from "../redirects";
import { recordSlugChange } from "../slug-tracking";

const TEST_PREFIX = "/__test__/";

async function cleanup() {
  await hierarchyDb.redirect.deleteMany({
    where: { fromPath: { startsWith: TEST_PREFIX } },
  });
  await hierarchyDb.slugHistory.deleteMany({
    where: { oldFullPath: { startsWith: TEST_PREFIX } },
  });
  bustRedirectCache();
}

beforeEach(cleanup);
afterEach(cleanup);

describe("lookupRedirect", () => {
  it("returns null when no redirect exists", async () => {
    const hit = await lookupRedirect(`${TEST_PREFIX}does-not-exist`);
    expect(hit).toBeNull();
  });

  it("returns the direct hop for a simple A → B redirect", async () => {
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
    expect(hit).toEqual({
      toPath: `${TEST_PREFIX}new-page`,
      statusCode: 301,
    });
  });

  it("follows a transitive chain A → B → C and returns C", async () => {
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
    expect(hit?.toPath).toBe(`${TEST_PREFIX}chain-c`);
  });

  it("detects cycles and returns null", async () => {
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
    expect(hit).toBeNull();
  });

  it("ignores inactive redirects", async () => {
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
    expect(hit).toBeNull();
  });

  it("preserves status code through the chain", async () => {
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

    // We return the LAST hop's status code (so a permanent-final chain
    // still emits 301 even if the first hop was 307). This is the
    // pragmatic choice for SEO: visitors land on the final URL with
    // the right "permanence" signal.
    const hit = await lookupRedirect(`${TEST_PREFIX}temp-redirect`);
    expect(hit?.toPath).toBe(`${TEST_PREFIX}final`);
    expect(hit?.statusCode).toBe(301);
  });
});

describe("recordSlugChange", () => {
  it("writes a history row and an auto-redirect atomically", async () => {
    // The recorder is keyed by (entityType, entityId) — we use a
    // synthetic numeric id for the test, no real entity needs to exist.
    const entityId = BigInt(999_999_001);

    await recordSlugChange(null, {
      entityType: "DESTINATION",
      entityId,
      oldSlug: "old-slug",
      oldFullPath: `${TEST_PREFIX}history-old`,
      newFullPath: `${TEST_PREFIX}history-new`,
      reason: "vitest fixture",
    });

    const history = await hierarchyDb.slugHistory.findFirst({
      where: { oldFullPath: `${TEST_PREFIX}history-old` },
    });
    expect(history).not.toBeNull();
    expect(history?.newFullPath).toBe(`${TEST_PREFIX}history-new`);

    const hit = await lookupRedirect(`${TEST_PREFIX}history-old`);
    expect(hit?.toPath).toBe(`${TEST_PREFIX}history-new`);
    expect(hit?.statusCode).toBe(301);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });

  it("is idempotent: re-recording the same change updates not duplicates", async () => {
    const entityId = BigInt(999_999_002);

    await recordSlugChange(null, {
      entityType: "HOTEL",
      entityId,
      oldSlug: "test-hotel",
      oldFullPath: `${TEST_PREFIX}idempotent-old`,
      newFullPath: `${TEST_PREFIX}idempotent-new-v1`,
    });

    // Pretend the admin renamed it again — the redirect target should
    // update to the latest target, not stack up multiple redirect rows.
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
    expect(redirects).toHaveLength(1);
    expect(redirects[0].toPath).toBe(`${TEST_PREFIX}idempotent-new-v2`);

    // History should have TWO rows (audit trail of both renames).
    const history = await hierarchyDb.slugHistory.findMany({
      where: { entityId },
    });
    expect(history).toHaveLength(2);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });

  it("deactivates any redirect FROM the new path (no A → B → A loops)", async () => {
    const entityId = BigInt(999_999_003);

    // Set up an existing redirect: /b → /a
    await hierarchyDb.redirect.create({
      data: {
        fromPath: `${TEST_PREFIX}path-b`,
        toPath: `${TEST_PREFIX}path-a`,
        statusCode: 301,
        source: "MANUAL",
        isActive: true,
      },
    });

    // Now rename: oldFullPath was /a, newFullPath is /b. That would
    // create A → B alongside the existing B → A — a loop. The recorder
    // must deactivate the old B → A row.
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
    expect(oldRedirect?.isActive).toBe(false);

    await hierarchyDb.slugHistory.deleteMany({ where: { entityId } });
  });
});
