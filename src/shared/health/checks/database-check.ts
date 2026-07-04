import { prisma } from "@/shared/database/prisma-client";
import type { HealthCheck, HealthCheckResult } from "../health.types";

/**
 * Verifies real database connectivity (a live query, not just "the client
 * exists") and reports the latest applied migration — Prisma's own
 * `_prisma_migrations` table is the source of truth for what's actually
 * been run against this database, not just what's on disk in
 * prisma/migrations/. Sprint 12's replacement for the always-healthy
 * placeholder every other shared check was before a real dependency existed.
 */
export class DatabaseHealthCheck implements HealthCheck {
  readonly name = "database";

  async check(): Promise<HealthCheckResult> {
    const checkedAt = new Date().toISOString();
    try {
      await prisma.$queryRaw`SELECT 1`;

      const latestMigration = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
        SELECT migration_name, finished_at FROM _prisma_migrations
        ORDER BY finished_at DESC NULLS LAST
        LIMIT 1
      `;

      return {
        name: this.name,
        status: "healthy",
        details: {
          connected: true,
          latestMigration: latestMigration[0]?.migration_name ?? null,
          migratedAt: latestMigration[0]?.finished_at?.toISOString() ?? null,
        },
        checkedAt,
      };
    } catch (error) {
      return {
        name: this.name,
        status: "unhealthy",
        details: { connected: false, error: error instanceof Error ? error.message : String(error) },
        checkedAt,
      };
    }
  }
}
