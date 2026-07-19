import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

/**
 * SEC-001: the vault's encryption key has its own lifecycle, separate from
 * every other module's config service, because its failure mode is unlike
 * a missing feature flag — an unset or weak key here means every stored
 * integration credential (payment gateway keys, supplier credentials, SMTP
 * password) is either unencrypted-in-practice or encrypted with a guessable
 * key. That justifies the one thing no other config service in this
 * project does yet: refusing to start in production rather than falling
 * back to an insecure default (see auth-config.service.ts's AUTH_JWT_SECRET
 * for the pattern this project used to accept instead — flagged in this
 * task's security report as a related, out-of-scope risk, not fixed here).
 *
 * Development: INTEGRATION_SECRETS_KEY may be unset — a fixed, clearly-
 * labelled local-only key is used so encryption still round-trips locally.
 * It is never derived from AUTH_JWT_SECRET or any other module's secret —
 * reusing a key across two unrelated security domains means rotating one
 * silently weakens the other, which is its own risk independent of whether
 * either individual value is strong.
 *
 * Production: INTEGRATION_SECRETS_KEY is mandatory and must be at least 32
 * raw characters. Missing or too short throws out of the constructor —
 * called eagerly at module load (see ../module.ts), so a misconfigured
 * production deployment fails at startup, not on the first request that
 * happens to touch a stored credential.
 */
const MIN_KEY_LENGTH = 32;
export const DEV_FALLBACK_KEY = "dev-only-integration-secrets-key-do-not-use-in-prod";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

const vaultEnvSchema = {
  integrationSecretsKey: { key: "INTEGRATION_SECRETS_KEY", type: "string" },
} satisfies EnvSchema;

export class VaultSecurityConfigService {
  private static instance: VaultSecurityConfigService | null = null;
  private readonly key: string;

  private constructor() {
    const result = validateEnv(vaultEnvSchema, process.env);
    const raw = "values" in result ? result.values.integrationSecretsKey : undefined;

    if (isProduction()) {
      if (!raw) {
        throw new Error(
          "INTEGRATION_SECRETS_KEY is not set. This is mandatory in production — the Integration Vault " +
          "cannot start without it, since it is what protects every stored payment/supplier/SMTP credential. " +
          "Set it to a random value of at least 32 characters (e.g. `openssl rand -hex 32`) before deploying."
        );
      }
      if (raw.length < MIN_KEY_LENGTH) {
        throw new Error(
          `INTEGRATION_SECRETS_KEY is only ${raw.length} characters — it must be at least ${MIN_KEY_LENGTH} in production. ` +
          "A short or guessable key defeats the encryption regardless of the algorithm used."
        );
      }
      this.key = raw;
      return;
    }

    // Non-production: allowed to be unset, but if someone does set a value,
    // hold it to the same minimum bar rather than silently accepting a weak
    // one — there is no reason a real value, once provided, should be exempt.
    if (raw && raw.length < MIN_KEY_LENGTH) {
      throw new Error(
        `INTEGRATION_SECRETS_KEY is set but only ${raw.length} characters — it must be at least ${MIN_KEY_LENGTH} characters if provided at all.`
      );
    }
    this.key = raw || DEV_FALLBACK_KEY;
  }

  static getInstance(): VaultSecurityConfigService {
    if (!VaultSecurityConfigService.instance) VaultSecurityConfigService.instance = new VaultSecurityConfigService();
    return VaultSecurityConfigService.instance;
  }

  /** Raw key material — secret-vault.ts derives the actual 32-byte AES key from this via SHA-256. */
  getRawKey(): string {
    return this.key;
  }

  isUsingDevFallback(): boolean {
    return this.key === DEV_FALLBACK_KEY;
  }
}
