import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Brute-force disable TLS validation for all Next.js dev threads
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Prisma 7 removed the schema-level `datasource.url` (and reading
 * DATABASE_URL implicitly at the client-construction site) in favor of an
 * explicit driver adapter — this is the one place that adapter is
 * constructed, so every repository stays unaware of the connection
 * mechanics entirely (same "swap the implementation behind the interface"
 * discipline as Logger/Config/DI).
 *
 * One PrismaClient per process — Fluid Compute reuses function instances
 * across concurrent requests, so a module-level singleton is correct here
 * (never construct a new PrismaClient per request). Cached on `globalThis`
 * so Next.js dev-mode hot-reload doesn't spawn a fresh client (and a fresh
 * connection pool) on every file change.
 *
 * `log: [{ emit: "event", level: "query" }]` (Sprint 15 — Observability
 * Platform) turns on Prisma's own query-event emitter — this is the single
 * choke point every repository across every module already goes through,
 * so it's the only way to get genuine system-wide slow-query tracking
 * without touching a single repository file. Nothing subscribes to the
 * event here; `src/modules/observability/module.ts` attaches the one
 * `prisma.$on("query", ...)` listener as a side effect of being imported,
 * same self-registration convention as every other cross-cutting concern.
 * Emitting the event costs one extra callback per query — it does not
 * change query behavior, transaction semantics, or connection handling.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient<"query"> | undefined;
}

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

function createPrismaClient(): PrismaClient<"query"> {
  let sslConfig: any = false;

  // Use the CA certificate if DATABASE_URL indicates we are requiring SSL
  if (process.env.DATABASE_URL?.includes("sslmode=require")) {
    try {
      const caPath = path.join(process.cwd(), "ca-certificate.crt");
      const caCert = fs.readFileSync(caPath).toString();
      sslConfig = {
        rejectUnauthorized: true,
        ca: caCert,
      };
    } catch (e) {
      console.warn("⚠️  ca-certificate.crt not found! Ensure it exists in the project root for secure database connections.");
      // Fallback for development if the user doesn't have the cert loaded properly yet
      sslConfig = { rejectUnauthorized: false };
    }
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: [{ emit: "event", level: "query" }] });
}

// Force flush the old cached connection on this specific reload so the new certificate is picked up!
globalThis.__prismaClient = undefined;

export const prisma: PrismaClient<"query"> = globalThis.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = prisma;
}
