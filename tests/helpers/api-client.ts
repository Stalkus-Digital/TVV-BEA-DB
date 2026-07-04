import request, { type Test } from "supertest";
import { TEST_BASE_URL } from "./test-server";

/**
 * Every non-website route is now gated by src/middleware.ts (Sprint 11 —
 * Auth Platform), so this file's tests need a valid token, not just the
 * previous sprint's raw agent. authenticateTestClient() logs in once as
 * the bootstrap SUPER_ADMIN (seeded by the auth module itself on first
 * use) and caches the access token for the rest of this test file's run —
 * see tests/helpers/test-setup.ts, which calls it in a global beforeAll.
 */
const BOOTSTRAP_ADMIN_CREDENTIALS = { email: "admin@tvv-travel-os.local", password: "ChangeMe123!" };

let cachedToken: string | null = null;

export async function authenticateTestClient(): Promise<void> {
  if (cachedToken) return;
  const response = await request(TEST_BASE_URL).post("/api/auth/login").send(BOOTSTRAP_ADMIN_CREDENTIALS);
  cachedToken = response.body?.data?.accessToken ?? null;
  if (!cachedToken) {
    throw new Error(`Test client failed to authenticate: ${JSON.stringify(response.body)}`);
  }
}

function withAuth(req: Test): Test {
  return cachedToken ? req.set("Authorization", `Bearer ${cachedToken}`) : req;
}

/** Same shape as the previous sprint's raw agent (api.get/post/patch/put/delete), now authenticated automatically. */
export const api = {
  get: (url: string) => withAuth(request(TEST_BASE_URL).get(url)),
  post: (url: string) => withAuth(request(TEST_BASE_URL).post(url)),
  patch: (url: string) => withAuth(request(TEST_BASE_URL).patch(url)),
  put: (url: string) => withAuth(request(TEST_BASE_URL).put(url)),
  delete: (url: string) => withAuth(request(TEST_BASE_URL).delete(url)),
};

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export function expectSuccess<T>(body: ApiEnvelope<T>): T {
  if (!body.success) {
    throw new Error(`Expected a successful API response, got error: ${JSON.stringify(body.error)}`);
  }
  return body.data as T;
}
