import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../../mocks/server";
import { isErr, isOk } from "@/shared/types";
import { createTestLogger } from "../../helpers/test-logger";
import { TripJackAuth } from "@/modules/supplier/adapters/tripjack/services/tripjack-auth.service";
import { fakeTripJackConfig, TEST_API_URL } from "./fake-tripjack-config";

describe("TripJackAuth", () => {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => mswServer.resetHandlers());
  afterAll(() => mswServer.close());

  it("returns UnauthorizedError (credential validation) when nothing is configured", async () => {
    const auth = new TripJackAuth(fakeTripJackConfig({ apiUrl: "", agencyId: "", userId: "", password: "" }), createTestLogger());
    const result = await auth.getToken();
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("UnauthorizedError");
  });

  it("uses a pre-provisioned static token directly, without ever calling the login endpoint", async () => {
    let loginCalled = false;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => {
        loginCalled = true;
        return HttpResponse.json({ token: "should-not-be-used", expiresInSeconds: 3600 });
      })
    );

    const auth = new TripJackAuth(fakeTripJackConfig({ token: "static-token-abc" }), createTestLogger());
    const result = await auth.getToken();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe("static-token-abc");
    expect(loginCalled).toBe(false);
  });

  it("logs in against the real endpoint (mocked) and returns the issued token", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "fresh-token", expiresInSeconds: 3600 })));
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    const result = await auth.getToken();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe("fresh-token");
  });

  it("caches the token — a second call before expiry does not call login again", async () => {
    let callCount = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => {
        callCount += 1;
        return HttpResponse.json({ token: `token-${callCount}`, expiresInSeconds: 3600 });
      })
    );
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    const first = await auth.getToken();
    const second = await auth.getToken();
    expect(callCount).toBe(1);
    if (isOk(first) && isOk(second)) expect(first.value).toBe(second.value);
  });

  it("automatically refreshes once the cached token is within the refresh buffer of expiring", async () => {
    let callCount = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => {
        callCount += 1;
        // 30s expiry is inside the 60s refresh buffer — every call should force a fresh login.
        return HttpResponse.json({ token: `token-${callCount}`, expiresInSeconds: 30 });
      })
    );
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    const first = await auth.getToken();
    const second = await auth.getToken();
    expect(callCount).toBe(2);
    if (isOk(first) && isOk(second)) expect(first.value).not.toBe(second.value);
  });

  it("invalidate() forces the next call to re-authenticate", async () => {
    let callCount = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => {
        callCount += 1;
        return HttpResponse.json({ token: `token-${callCount}`, expiresInSeconds: 3600 });
      })
    );
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    await auth.getToken();
    auth.invalidate();
    await auth.getToken();
    expect(callCount).toBe(2);
  });

  it("maps a non-2xx login response through TripJackErrorHandler", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ message: "invalid credentials" }, { status: 400 })));
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    const result = await auth.getToken();
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("ValidationError");
  });

  it("returns a TimeoutError when the login request exceeds the configured timeout", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ token: "too-late", expiresInSeconds: 3600 });
      })
    );
    const auth = new TripJackAuth(fakeTripJackConfig({ timeoutMs: 10 }), createTestLogger());
    const result = await auth.getToken();
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("TimeoutError");
  });

  it("returns InternalError when the login response is missing token/expiresInSeconds", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ nonsense: true })));
    const auth = new TripJackAuth(fakeTripJackConfig(), createTestLogger());
    const result = await auth.getToken();
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("InternalError");
  });
});
