import { afterAll } from "vitest";
import { prisma } from "@/shared/database/prisma-client";

/**
 * Each isolated test file gets its own module registry (Vitest's default
 * `isolate: true`), so each one opens its own Prisma connection pool the
 * first time a service/repository is used. Without closing it here, Node
 * keeps those TCP connections open after the file's tests finish, which is
 * why the run used to hang on exit ("close timed out ... something
 * prevents Vite server from exiting").
 */
afterAll(async () => {
  await prisma.$disconnect();
});
