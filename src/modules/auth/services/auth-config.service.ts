import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const authEnvSchema = {
  jwtSecret: { key: "AUTH_JWT_SECRET", type: "string", default: "dev-insecure-secret-change-in-production" },
  accessTokenTtlSeconds: { key: "AUTH_ACCESS_TOKEN_TTL_SECONDS", type: "number", default: 900 }, // 15 min
  refreshTokenTtlSeconds: { key: "AUTH_REFRESH_TOKEN_TTL_SECONDS", type: "number", default: 604_800 }, // 7 days
  refreshTokenRememberMeTtlSeconds: { key: "AUTH_REFRESH_TOKEN_REMEMBER_ME_TTL_SECONDS", type: "number", default: 2_592_000 }, // 30 days
  passwordResetTtlSeconds: { key: "AUTH_PASSWORD_RESET_TTL_SECONDS", type: "number", default: 3_600 }, // 1 hour
  maxFailedLoginAttempts: { key: "AUTH_MAX_FAILED_LOGIN_ATTEMPTS", type: "number", default: 5 },
  accountLockDurationSeconds: { key: "AUTH_ACCOUNT_LOCK_DURATION_SECONDS", type: "number", default: 900 }, // 15 min
} satisfies EnvSchema;

export interface AuthConfigValues {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  refreshTokenRememberMeTtlSeconds: number;
  passwordResetTtlSeconds: number;
  maxFailedLoginAttempts: number;
  accountLockDurationSeconds: number;
}

function loadAuthConfig(source: Record<string, string | undefined> = process.env): AuthConfigValues {
  const result = validateEnv(authEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid auth module environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * Singleton config accessor, same pattern as every other module's own
 * config service (SupplierConfigService, WebsiteConfigService) — nothing
 * else in this module reads process.env directly. AUTH_JWT_SECRET's
 * insecure default is intentional for local/dev use (no .env exists
 * anywhere in this project yet, per docs/15) — it MUST be overridden via a
 * real secret before any non-local deployment; see docs/22's Security
 * Features section.
 */
export class AuthConfigService {
  private static instance: AuthConfigService | null = null;
  private readonly values: AuthConfigValues;

  private constructor() {
    this.values = loadAuthConfig();
  }

  static getInstance(): AuthConfigService {
    if (!AuthConfigService.instance) AuthConfigService.instance = new AuthConfigService();
    return AuthConfigService.instance;
  }

  get<K extends keyof AuthConfigValues>(key: K): AuthConfigValues[K] {
    return this.values[key];
  }
}
