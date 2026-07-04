import { type ChildProcess, spawn } from "node:child_process";

export const TEST_PORT = 3939;
export const TEST_BASE_URL = `http://localhost:${TEST_PORT}`;

let serverProcess: ChildProcess | null = null;

async function waitForHealthy(baseUrl: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok || response.status === 200) return;
    } catch {
      // server not up yet — keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Test server did not become healthy within ${timeoutMs}ms — did you run "npm run build" first?`);
}

/**
 * Boots a real `next start` process against a pre-built `.next` output —
 * integration/e2e tests exercise the actual route handlers over real HTTP,
 * not an in-process function call, so this has to be a real server.
 * Requires `npm run build` to have been run first. `port` defaults to
 * TEST_PORT (integration's own port, 3939) — tests/e2e/global-setup.ts
 * passes 3940 instead so the two suites never collide if run concurrently.
 * Deliberately started only AFTER the caller has already reset+seeded the
 * database (see both global-setup.ts files): starting the server before
 * seeding lets its own per-route module instances race each other seeding
 * the same tables concurrently on first touch, which is what Playwright's
 * built-in `webServer` orchestration did before this was pulled out into an
 * explicit, ordered globalSetup step.
 */
export async function startTestServer(port: number = TEST_PORT): Promise<void> {
  if (serverProcess) return;
  const baseUrl = `http://localhost:${port}`;
  serverProcess = spawn("./node_modules/.bin/next", ["start", "-p", String(port)], {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });
  await waitForHealthy(baseUrl, 30_000);
}

export async function stopTestServer(): Promise<void> {
  if (!serverProcess) return;
  serverProcess.kill("SIGTERM");
  serverProcess = null;
}
