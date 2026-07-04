import type { TripJackConfig, TripJackConfigValues } from "@/modules/supplier/adapters/tripjack/config/tripjack.config";

export const TEST_API_URL = "https://tripjack-api.example.com";

/**
 * `TripJackConfig` has a private constructor (singleton, reads `process.env`
 * once) — this duck-typed stand-in (cast, not a real instance) lets
 * `TripJackAuth`/`TripJackClient` unit tests exercise different
 * configured/not-configured/static-token scenarios without fighting the
 * singleton's one-shot initialization. Adapter-level tests (which
 * construct `TripJackAdapter` directly, and therefore always go through
 * the real `TripJackConfig.getInstance()`) rely on `.env.test`'s
 * `TRIPJACK_*` values instead — see tests/unit/tripjack/tripjack-adapter.test.ts.
 */
export function fakeTripJackConfig(overrides: Partial<TripJackConfigValues> = {}): TripJackConfig {
  const values: TripJackConfigValues = {
    apiUrl: TEST_API_URL,
    agencyId: "test-agency",
    userId: "test-user",
    password: "test-password",
    token: "",
    timeoutMs: 5_000,
    retryCount: 2,
    ...overrides,
  };

  return {
    get: (key: keyof TripJackConfigValues) => values[key],
    isConfigured: () => Boolean(values.apiUrl && values.agencyId && values.userId && values.password),
  } as unknown as TripJackConfig;
}
