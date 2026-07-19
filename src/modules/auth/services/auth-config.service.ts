import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const authEnvSchema = {
  jwtSecret: { key: "AUTH_JWT_SECRET", type: "string", default: "dev-insecure-secret-change-in-production" },
  accessTokenTtlSeconds: { key: "AUTH_ACCESS_TOKEN_TTL_SECONDS", type: "number", default: 900 }, // 15 min
  refreshTokenTtlSeconds: { key: "AUTH_REFRESH_TOKEN_TTL_SECONDS", type: "number", default: 604_800 }, // 7 days
  refreshTokenRememberMeTtlSeconds: { key: "AUTH_REFRESH_TOKEN_REMEMBER_ME_TTL_SECONDS", type: "number", default: 2_592_000 }, // 30 days
  passwordResetTtlSeconds: { key: "AUTH_PASSWORD_RESET_TTL_SECONDS", type: "number", default: 3_600 }, // 1 hour
  emailVerificationTtlSeconds: { key: "AUTH_EMAIL_VERIFICATION_TTL_SECONDS", type: "number", default: 86_400 }, // 24 hours
  frontendUrl: { key: "FRONTEND_URL", type: "string", default: "http://localhost:3001" },
  maxFailedLoginAttempts: { key: "AUTH_MAX_FAILED_LOGIN_ATTEMPTS", type: "number", default: 5 },
  accountLockDurationSeconds: { key: "AUTH_ACCOUNT_LOCK_DURATION_SECONDS", type: "number", default: 900 }, // 15 min
} satisfies EnvSchema;

export interface AuthConfigValues {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  refreshTokenRememberMeTtlSeconds: number;
  passwordResetTtlSeconds: number;
  emailVerificationTtlSeconds: number;
  frontendUrl: string;
  maxFailedLoginAttempts: number;
  accountLockDurationSeconds: number;
}

/**
 * Static `process.env.AUTH_JWT_SECRET` access is intentional: Next.js (and
 * Vercel middleware) only reliably injects env vars that appear as literal
 * property reads. Dynamic `process.env[key]` lookups can silently miss the
 * Vercel-injected secret and fall back to the insecure default — which is
 * exactly how login (Node route) and middleware ended up signing/verifying
 * with different secrets ("Invalid token signature" on every admin API).
 */
function authEnvSource(): Record<string, string | undefined> {
  return {
    ...process.env,
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_ACCESS_TOKEN_TTL_SECONDS: process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    AUTH_REFRESH_TOKEN_TTL_SECONDS: process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
    AUTH_REFRESH_TOKEN_REMEMBER_ME_TTL_SECONDS: process.env.AUTH_REFRESH_TOKEN_REMEMBER_ME_TTL_SECONDS,
    AUTH_PASSWORD_RESET_TTL_SECONDS: process.env.AUTH_PASSWORD_RESET_TTL_SECONDS,
    AUTH_EMAIL_VERIFICATION_TTL_SECONDS: process.env.AUTH_EMAIL_VERIFICATION_TTL_SECONDS,
    FRONTEND_URL: process.env.FRONTEND_URL,
    AUTH_MAX_FAILED_LOGIN_ATTEMPTS: process.env.AUTH_MAX_FAILED_LOGIN_ATTEMPTS,
    AUTH_ACCOUNT_LOCK_DURATION_SECONDS: process.env.AUTH_ACCOUNT_LOCK_DURATION_SECONDS,
  };
}

function loadAuthConfig(source: Record<string, string | undefined> = authEnvSource()): AuthConfigValues {
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
 * insecure default is intentional for local/dev use — it MUST be overridden
 * via a real secret (Vercel project env / .env) before any non-local
 * deployment; see docs/22's Security Features section.
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
