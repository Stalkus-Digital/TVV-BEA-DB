import { test as base, type APIRequestContext } from "@playwright/test";

/**
 * Every route this suite exercises (besides /api/website/* and
 * /api/auth/login itself) is now gated by src/middleware.ts (Sprint 11).
 * `authedRequest` is a drop-in replacement for Playwright's built-in
 * `request` fixture, pre-authenticated as the bootstrap SUPER_ADMIN — spec
 * files that used to destructure `{ request }` now destructure
 * `{ authedRequest }` and otherwise call it exactly the same way.
 */
export const test = base.extend<{ authedRequest: APIRequestContext }>({
  authedRequest: async ({ playwright, baseURL, request }, use) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: { email: "admin@tvv-travel-os.local", password: "ChangeMe123!" },
    });
    const body = await loginResponse.json();
    const context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${body.data.accessToken}`, "Content-Type": "application/json" },
    });
    await use(context);
    await context.dispose();
  },
});

export { expect } from "@playwright/test";
