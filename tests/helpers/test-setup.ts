import { beforeAll } from "vitest";
import { authenticateTestClient } from "./api-client";

/** Runs once per integration test file — authenticates the shared `api` client before any test in that file makes a request. */
beforeAll(async () => {
  await authenticateTestClient();
});
