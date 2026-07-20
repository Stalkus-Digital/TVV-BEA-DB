import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

/**
 * SECURITY-002A: mirrors VaultSecurityConfigService's fail-closed pattern
 * (see integrations/services/vault-security.service.ts), which explicitly
 * flagged AUTH_JWT_SECRET's insecure default as the "related, out-of-scope
 * risk, not fixed here" — this closes that gap. A weak or default JWT
 * secret in production lets anyone forge a valid admin access token, so
 * this fails at startup rather than on the first forged request.
 */
const INSECURE_DEFAULT_JWT_SECRET = "dev-insecure-secret-change-in-production";
const MIN_JWT_SECRET_LENGTH = 32;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

const authEnvSchema = {
  jwtSecret: { key: "AUTH_JWT_SECRET", type: "string", default: INSECURE_DEFAULT_JWT_SECRET },
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
 * insecure default is for local/dev use only: in production it is
 * mandatory and must not be the known placeholder, enforced below (not
 * just documented) since a weak secret here means every admin JWT can be
 * forged.
 */
export class AuthConfigService {
  private static instance: AuthConfigService | null = null;
  private readonly values: AuthConfigValues;

  private constructor() {
    this.values = loadAuthConfig();

    if (isProduction()) {
      // Static reference (not a dynamic lookup) — same Vercel-injection
      // reasoning as authEnvSource() above.
      const raw = process.env.AUTH_JWT_SECRET;
      if (!raw) {
        throw new Error(
          "AUTH_JWT_SECRET is not set. This is mandatory in production — every admin/staff JWT is signed " +
          "with it, and an unset value silently falls back to a publicly-known placeholder. Set it to a " +
          "random value of at least 32 characters (e.g. `openssl rand -hex 32`) before deploying."
        );
      }
      if (raw === INSECURE_DEFAULT_JWT_SECRET) {
        throw new Error(
          "AUTH_JWT_SECRET is set to the known insecure default value. Anyone who knows this default can " +
          "forge a valid admin JWT for this deployment. Set it to a random value of at least " +
          `${MIN_JWT_SECRET_LENGTH} characters (e.g. \`openssl rand -hex 32\`) before deploying.`
        );
      }
      if (raw.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(
          `AUTH_JWT_SECRET is only ${raw.length} characters — it must be at least ${MIN_JWT_SECRET_LENGTH} in ` +
          "production. A short or guessable secret defeats the HMAC signature regardless of the algorithm used."
        );
      }
    }
  }

  static getInstance(): AuthConfigService {
    if (!AuthConfigService.instance) AuthConfigService.instance = new AuthConfigService();
    return AuthConfigService.instance;
  }

  get<K extends keyof AuthConfigValues>(key: K): AuthConfigValues[K] {
    return this.values[key];
  }
}
