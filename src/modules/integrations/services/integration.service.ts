import { prisma } from "@/shared/database/prisma-client";
import { err, ok, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { BaseService, type ServiceContext } from "@/shared/services";
import {
  BUILTIN_PROVIDERS,
  ferryOperatorDefinition,
  getBuiltinDefinition,
  vaultCredentialsSatisfied,
} from "../catalog/builtin-providers";
import { decryptSecret, encryptSecret, lastFour } from "../crypto/secret-vault";
import { AuditEventType, getAuditLogService } from "@/modules/auth";
import {
  ACTIVE_PAYMENT_CONFIG_KEY,
  SYSTEM_PAYMENTS_KEY,
  type IntegrationProviderDetail,
  type IntegrationProviderSummary,
  type IntegrationSecretMeta,
  type IntegrationWebhookRecord,
  type ProviderFieldSchema,
} from "../types/integration";
import { IntegrationStatusEnum } from "../types/integration-status";
import { getProviderValidator } from "../validators/provider-validators";

function toIso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function asConfig(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function fieldsFor(key: string, config: Record<string, unknown>): ProviderFieldSchema[] {
  const builtin = getBuiltinDefinition(key);
  if (builtin) return builtin.fields;
  if (key.startsWith("ferry:")) {
    const code = key.slice("ferry:".length);
    return ferryOperatorDefinition(code, (config.name as string) || code).fields;
  }
  return [];
}

function vaultSecretMeta(
  fields: ProviderFieldSchema[],
  secrets: Array<{ fieldKey: string; lastFour: string | null; updatedAt: Date }>
): IntegrationSecretMeta[] {
  return fields
    .filter((f) => f.secret)
    .map((f) => {
      const stored = secrets.find((s) => s.fieldKey === f.key);
      return {
        fieldKey: f.key,
        configured: Boolean(stored),
        lastFour: stored?.lastFour ?? null,
        updatedAt: toIso(stored?.updatedAt),
      };
    });
}

/**
 * Determine integration status based on configuration and test results.
 *
 * Rules:
 * - DISABLED: explicitly disabled by admin
 * - NOT_CONFIGURED: required credentials incomplete
 * - CONFIGURED: all required credentials entered but never tested
 * - TESTING: test in progress (controlled by caller)
 * - CONNECTED: test succeeded (lastTestOk === true)
 * - FAILED: test failed (lastTestOk === false)
 *
 * `vaultOk` must come from `vaultCredentialsSatisfied()` — the same function
 * `update()`/`refreshStatusesFromVault()` use — not from a raw
 * secretsConfigured/secretsTotal comparison. That comparison was tried here
 * previously and is wrong for any provider with an optional secret field
 * (Razorpay's webhookSecret, PhonePe's clientSecret, Sembark's
 * webhookSecret, Ferry's apiSecret) or an OR-style credential set
 * (TripJack: token OR agencyId+userId+password): secretsTotal counts EVERY
 * secret-kind field regardless of whether it's required, so a provider
 * fully configured via token-only auth (secretsConfigured=1, secretsTotal=2
 * because the unused password field is also secret-kind) was permanently
 * stuck at NOT_CONFIGURED — even after a real successful test — because
 * this function silently overrode the correct status `update()`/
 * `testConnection()` had already computed and persisted.
 */
function effectiveStatus(
  dbStatus: string,
  lastTestOk: boolean | null,
  vaultOk: boolean
): string {
  // Admin explicitly disabled
  if (dbStatus === IntegrationStatusEnum.DISABLED) {
    return IntegrationStatusEnum.DISABLED;
  }

  // Required credentials incomplete
  if (!vaultOk) {
    return IntegrationStatusEnum.NOT_CONFIGURED;
  }

  // All secrets configured
  // Check test results
  if (lastTestOk === true) {
    return IntegrationStatusEnum.CONNECTED;
  }

  if (lastTestOk === false) {
    return IntegrationStatusEnum.FAILED;
  }

  // Secrets configured but never tested
  return IntegrationStatusEnum.CONFIGURED;
}

export class IntegrationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async ensureSeeded(): Promise<void> {
    for (const def of BUILTIN_PROVIDERS) {
      const existing = await prisma.integrationProvider.findUnique({ where: { key: def.key } });
      if (existing) {
        // Keep name/description in sync with catalog
        if (existing.name !== def.name || existing.description !== def.description) {
          await prisma.integrationProvider.update({
            where: { id: existing.id },
            data: { name: def.name, description: def.description },
          });
        }
        if (def.webhooks?.length) {
          for (const wh of def.webhooks) {
            const found = await prisma.integrationWebhook.findFirst({
              where: { providerId: existing.id, path: wh.path },
            });
            if (!found) {
              await prisma.integrationWebhook.create({
                data: {
                  providerId: existing.id,
                  eventType: wh.eventType,
                  path: wh.path,
                  isActive: true,
                },
              });
            }
          }
        }
        continue;
      }

      const created = await prisma.integrationProvider.create({
        data: {
          key: def.key,
          category: def.category,
          name: def.name,
          description: def.description,
          isBuiltin: true,
          status: IntegrationStatusEnum.NOT_CONFIGURED,
          config:
            def.key === SYSTEM_PAYMENTS_KEY
              ? { [ACTIVE_PAYMENT_CONFIG_KEY]: "razorpay" }
              : {},
        },
      });

      if (def.webhooks?.length) {
        for (const wh of def.webhooks) {
          await prisma.integrationWebhook.create({
            data: {
              providerId: created.id,
              eventType: wh.eventType,
              path: wh.path,
              isActive: true,
            },
          });
        }
      }
    }

    await this.refreshStatusesFromVault();
  }

  /**
   * Recompute status from vault/config only (never .env).
   * CONNECTED only when vault credentials are complete AND lastTestOk === true.
   */
  private async refreshStatusesFromVault(): Promise<void> {
    const providers = await prisma.integrationProvider.findMany({
      include: { secrets: true },
    });
    for (const provider of providers) {
      if (provider.key === SYSTEM_PAYMENTS_KEY) continue;
      if (provider.status === IntegrationStatusEnum.DISABLED) continue;

      const config = asConfig(provider.config);
      const fields = fieldsFor(provider.key, config);
      if (fields.length === 0) continue;

      const secretKeys = new Set(provider.secrets.map((s) => s.fieldKey));
      const vaultOk = vaultCredentialsSatisfied(provider.key, fields, secretKeys, config);

      let nextStatus: string;
      if (!vaultOk) {
        nextStatus = IntegrationStatusEnum.NOT_CONFIGURED;
      } else if (provider.lastTestOk === true) {
        nextStatus = IntegrationStatusEnum.CONNECTED;
      } else if (provider.lastTestOk === false) {
        nextStatus = IntegrationStatusEnum.FAILED;
      } else {
        nextStatus = IntegrationStatusEnum.CONFIGURED;
      }

      const clearTest = !vaultOk && (provider.lastTestOk !== null || provider.lastTestedAt !== null);
      if (provider.status !== nextStatus || clearTest) {
        await prisma.integrationProvider.update({
          where: { id: provider.id },
          data: {
            status: nextStatus,
            ...(clearTest
              ? { lastTestOk: null, lastTestedAt: null, lastTestMessage: null }
              : {}),
          },
        });
      }
    }
  }

  async list(): Promise<Result<IntegrationProviderSummary[], AppError>> {
    await this.ensureSeeded();
    const rows = await prisma.integrationProvider.findMany({
      include: { secrets: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const items: IntegrationProviderSummary[] = rows.map((row) => {
      const config = asConfig(row.config);
      const fields = fieldsFor(row.key, config);
      const secretFields = vaultSecretMeta(fields, row.secrets);
      const secretsTotal = secretFields.length;
      const secretsConfigured = secretFields.filter((s) => s.configured).length;

      // Status reflects whether the REQUIRED credential set is satisfied
      // (respecting optional fields and TripJack's token-OR-agency rule),
      // not a raw configured/total secret-field count. SYSTEM_PAYMENTS_KEY
      // has no fields at all (it's a routing toggle, not a credentialed
      // provider) — vaultCredentialsSatisfied() correctly returns false for
      // it, matching this function's pre-existing behavior for that key.
      const secretKeys = new Set(row.secrets.map((s) => s.fieldKey));
      const vaultOk = vaultCredentialsSatisfied(row.key, fields, secretKeys, config);
      const status = effectiveStatus(row.status, row.lastTestOk, vaultOk);

      return {
        id: row.id,
        key: row.key,
        category: row.category,
        name: row.name,
        description: row.description,
        isBuiltin: row.isBuiltin,
        status,
        config: asConfig(row.config),
        lastTestedAt: toIso(row.lastTestedAt),
        lastTestOk: row.lastTestOk,
        lastTestMessage: row.lastTestMessage,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        secretsConfigured,
        secretsTotal,
        secretFields,
      };
    });

    return ok(items);
  }

  async getByKey(key: string): Promise<Result<IntegrationProviderDetail, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true, webhooks: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const config = asConfig(row.config);
    const fields = fieldsFor(row.key, config);
    const secretFields = vaultSecretMeta(fields, row.secrets);
    const secretsConfigured = secretFields.filter((s) => s.configured).length;
    const secretsTotal = secretFields.length;

    // See list()'s comment: status must reflect whether the REQUIRED
    // credential set is satisfied, not a raw configured/total field count.
    const secretKeys = new Set(row.secrets.map((s) => s.fieldKey));
    const vaultOk = vaultCredentialsSatisfied(row.key, fields, secretKeys, config);
    const status = effectiveStatus(row.status, row.lastTestOk, vaultOk);

    // publicConfig: vault/config only — do not surface env values as if configured in UI
    const publicConfig: Record<string, unknown> = { ...asConfig(row.config) };

    const webhooks: IntegrationWebhookRecord[] = row.webhooks.map((w) => ({
      id: w.id,
      providerId: w.providerId,
      eventType: w.eventType,
      path: w.path,
      isActive: w.isActive,
    }));

    return ok({
      id: row.id,
      key: row.key,
      category: row.category,
      name: row.name,
      description: row.description,
      isBuiltin: row.isBuiltin,
      status,
      config: asConfig(row.config),
      lastTestedAt: toIso(row.lastTestedAt),
      lastTestOk: row.lastTestOk,
      lastTestMessage: row.lastTestMessage,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      secretsConfigured,
      secretsTotal,
      secretFields,
      fields,
      webhooks,
      publicConfig,
    });
  }

  async update(
    key: string,
    input: { config?: Record<string, unknown>; secrets?: Record<string, string>; status?: string },
    actorUserId: string | null = null
  ): Promise<Result<IntegrationProviderDetail, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key } });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const fields = fieldsFor(key, asConfig(row.config));
    const nextConfig = { ...asConfig(row.config), ...(input.config ?? {}) };
    const changedSecretFields: string[] = [];
    const changedConfigFields: string[] = input.config ? Object.keys(input.config) : [];

    if (input.secrets) {
      for (const [fieldKey, value] of Object.entries(input.secrets)) {
        if (!value || !value.trim()) continue;
        const schema = fields.find((f) => f.key === fieldKey);
        if (!schema) continue;
        if (!schema.secret) {
          nextConfig[fieldKey] = value;
          continue;
        }
        const encrypted = encryptSecret(value.trim());
        await prisma.integrationSecret.upsert({
          where: { providerId_fieldKey: { providerId: row.id, fieldKey } },
          create: {
            providerId: row.id,
            fieldKey,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            lastFour: lastFour(value.trim()),
          },
          update: {
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            lastFour: lastFour(value.trim()),
          },
        });
        changedSecretFields.push(fieldKey);
      }
    }

    for (const f of fields) {
      if (!f.secret && input.config && input.config[f.key] !== undefined) {
        nextConfig[f.key] = input.config[f.key];
      }
    }

    const secrets = await prisma.integrationSecret.findMany({ where: { providerId: row.id } });
    const secretKeys = new Set(secrets.map((s) => s.fieldKey));
    const vaultOk = vaultCredentialsSatisfied(key, fields, secretKeys, nextConfig);

    const credentialsTouched =
      changedSecretFields.length > 0 ||
      changedConfigFields.some((k) => {
        const schema = fields.find((f) => f.key === k);
        return schema && (schema.required || key === "tripjack");
      });

    // Determine next status based on new model
    let nextStatus = input.status ?? row.status;
    let clearTest = false;

    if (nextStatus !== IntegrationStatusEnum.DISABLED) {
      if (!vaultOk) {
        // Credentials incomplete—go to NOT_CONFIGURED
        nextStatus = IntegrationStatusEnum.NOT_CONFIGURED;
        clearTest = true;
      } else if (credentialsTouched) {
        // Credentials changed—must re-test, go to CONFIGURED
        nextStatus = IntegrationStatusEnum.CONFIGURED;
        clearTest = true;
      } else if (row.lastTestOk === true) {
        // Credentials unchanged and last test passed—stay CONNECTED
        nextStatus = IntegrationStatusEnum.CONNECTED;
      } else {
        // Credentials complete but not tested yet
        nextStatus = IntegrationStatusEnum.CONFIGURED;
      }
    }

    const status = nextStatus;

    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        config: nextConfig as object,
        status,
        updatedAt: new Date(),
        ...(clearTest
          ? { lastTestOk: null, lastTestedAt: null, lastTestMessage: null }
          : {}),
      },
    });

    if (changedSecretFields.length > 0 || changedConfigFields.length > 0 || input.status) {
      await getAuditLogService().record({
        eventType: AuditEventType.INTEGRATION_CONFIG_CHANGED,
        actorUserId,
        details: {
          providerKey: key,
          changedSecretFields,
          changedConfigFields,
          statusChangedTo: input.status ?? null,
        },
      });
    }

    return this.getByKey(key);
  }

  async setActivePaymentProvider(provider: "razorpay" | "phonepe", actorUserId: string | null = null): Promise<Result<{ activeProvider: string }, AppError>> {
    if (provider !== "razorpay" && provider !== "phonepe") {
      return err(new ValidationError("activeProvider must be razorpay or phonepe"));
    }
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key: SYSTEM_PAYMENTS_KEY } });
    if (!row) return err(new NotFoundError("Payments system provider missing"));

    // FIX: Check if the selected provider has valid credentials before marking as CONNECTED
    const providerRow = await prisma.integrationProvider.findUnique({
      where: { key: provider },
      include: { secrets: true },
    });
    if (!providerRow) return err(new NotFoundError(`Provider "${provider}" not found`));

    const providerConfig = asConfig(providerRow.config);
    const providerFields = fieldsFor(provider, providerConfig);
    const providerSecretKeys = new Set(providerRow.secrets.map((s) => s.fieldKey));
    const providerHasCredentials = vaultCredentialsSatisfied(provider, providerFields, providerSecretKeys, providerConfig);

    // Status should be CONNECTED only if the selected provider is actually CONNECTED
    const paymentStatus = providerHasCredentials && providerRow.lastTestOk === true
      ? IntegrationStatusEnum.CONNECTED
      : IntegrationStatusEnum.CONFIGURED;

    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        config: { [ACTIVE_PAYMENT_CONFIG_KEY]: provider },
        status: paymentStatus,
      },
    });
    await getAuditLogService().record({
      eventType: AuditEventType.INTEGRATION_CONFIG_CHANGED,
      actorUserId,
      details: { providerKey: SYSTEM_PAYMENTS_KEY, activePaymentProviderChangedTo: provider },
    });
    return ok({ activeProvider: provider });
  }

  async getActivePaymentProvider(): Promise<"razorpay" | "phonepe"> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key: SYSTEM_PAYMENTS_KEY } });
    const cfg = asConfig(row?.config);
    const active = cfg[ACTIVE_PAYMENT_CONFIG_KEY];
    return active === "phonepe" ? "phonepe" : "razorpay";
  }

  async createFerryOperator(input: {
    code: string;
    name: string;
  }): Promise<Result<IntegrationProviderDetail, AppError>> {
    const code = input.code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!code) return err(new ValidationError("code is required"));
    if (!input.name?.trim()) return err(new ValidationError("name is required"));
    const key = `ferry:${code}`;
    const existing = await prisma.integrationProvider.findUnique({ where: { key } });
    if (existing) return err(new ValidationError(`Ferry operator "${code}" already exists`));

    const def = ferryOperatorDefinition(code, input.name.trim());
    await prisma.integrationProvider.create({
      data: {
        key: def.key,
        category: def.category,
        name: def.name,
        description: def.description,
        isBuiltin: false,
        status: IntegrationStatusEnum.NOT_CONFIGURED,
        config: { name: input.name.trim(), code },
      },
    });
    return this.getByKey(key);
  }

  async testConnection(
    key: string,
    draft?: { config?: Record<string, unknown>; secrets?: Record<string, string> },
    actorUserId: string | null = null
  ): Promise<Result<{ ok: boolean; message: string }, AppError>> {
    // Persist any draft credentials from the Configure form before testing
    const hasDraftSecrets = Boolean(draft?.secrets && Object.keys(draft.secrets).length > 0);
    const hasDraftConfig = Boolean(draft?.config && Object.keys(draft.config).length > 0);
    if (hasDraftSecrets || hasDraftConfig) {
      const saved = await this.update(
        key,
        {
          config: draft?.config,
          secrets: draft?.secrets,
        },
        actorUserId
      );
      if (!saved.ok) return saved;
    }

    // Test must use vault credentials only for badge purposes — resolve vault first
    const vaultOnly = await this.resolveVaultValues(key);
    if (!vaultOnly.ok) return vaultOnly;

    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));
    const vaultConfig = asConfig(row.config);
    const vaultSecretKeys = new Set(row.secrets.map((s) => s.fieldKey));
    const fields = fieldsFor(key, vaultConfig);
    if (!vaultCredentialsSatisfied(key, fields, vaultSecretKeys, vaultConfig)) {
      return err(new ValidationError("Save all required credentials in Configure before testing"));
    }

    // Perform real provider validation
    const validator = getProviderValidator(key);
    if (!validator) {
      return err(new ValidationError(`No health check available for "${key}"`));
    }

    const result = await validator.testConnection(vaultOnly.value);
    const testOk = result.ok;
    const message = result.message;

    await prisma.integrationProvider.update({
      where: { key },
      data: {
        lastTestedAt: new Date(),
        lastTestOk: testOk,
        lastTestMessage: message,
        status: testOk ? IntegrationStatusEnum.CONNECTED : IntegrationStatusEnum.FAILED,
      },
    });

    return ok({ ok: testOk, message });
  }

  /**
   * Resolve field values from vault/config only (no env). Used for status badge and Test.
   */
  async resolveVaultValues(key: string): Promise<Result<Record<string, string>, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const fields = fieldsFor(key, asConfig(row.config));
    const config = asConfig(row.config);
    const out: Record<string, string> = {};

    for (const f of fields) {
      const stored = row.secrets.find((s) => s.fieldKey === f.key);
      if (stored) {
        try {
          out[f.key] = decryptSecret({
            ciphertext: stored.ciphertext,
            iv: stored.iv,
            authTag: stored.authTag,
          });
          continue;
        } catch {
          return err(new InternalError(`Failed to decrypt secret ${f.key} for ${key}`));
        }
      }
      if (!f.secret && config[f.key] !== undefined && config[f.key] !== null && String(config[f.key]).trim() !== "") {
        out[f.key] = String(config[f.key]);
      }
    }

    for (const [k, v] of Object.entries(config)) {
      if (out[k] === undefined && v !== undefined && v !== null) out[k] = String(v);
    }

    return ok(out);
  }

  /**
   * Resolve all field values for a provider: DB secret → config → env fallback.
   * Used at runtime for actual API calls (not for the CONNECTED badge).
   */
  async resolveProviderValues(key: string): Promise<Result<Record<string, string>, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const fields = fieldsFor(key, asConfig(row.config));
    const config = asConfig(row.config);
    const out: Record<string, string> = {};

    for (const f of fields) {
      const stored = row.secrets.find((s) => s.fieldKey === f.key);
      if (stored) {
        try {
          out[f.key] = decryptSecret({
            ciphertext: stored.ciphertext,
            iv: stored.iv,
            authTag: stored.authTag,
          });
          continue;
        } catch {
          return err(new InternalError(`Failed to decrypt secret ${f.key} for ${key}`));
        }
      }
      if (!f.secret && config[f.key] !== undefined && config[f.key] !== null) {
        out[f.key] = String(config[f.key]);
        continue;
      }
      if (f.envFallback && process.env[f.envFallback]) {
        out[f.key] = process.env[f.envFallback] as string;
      }
    }

    for (const [k, v] of Object.entries(config)) {
      if (out[k] === undefined && v !== undefined && v !== null) out[k] = String(v);
    }

    return ok(out);
  }

  async listRecentWebhookEvents(limit = 20): Promise<Result<Array<{ id: string; type: string; status: string; createdAt: string }>, AppError>> {
    const rows = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return ok(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  }

  async deleteIntegration(key: string, actorUserId: string | null = null): Promise<Result<{ deleted: boolean }, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key } });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    // Cannot delete builtin providers
    if (row.isBuiltin) {
      return err(new ValidationError("Cannot delete builtin integrations. Use Disable instead."));
    }

    // Delete secrets and provider
    await prisma.integrationSecret.deleteMany({ where: { providerId: row.id } });
    await prisma.integrationProvider.delete({ where: { id: row.id } });

    await getAuditLogService().record({
      eventType: AuditEventType.INTEGRATION_CONFIG_CHANGED,
      actorUserId,
      details: { providerKey: key, action: "deleted" },
    });

    return ok({ deleted: true });
  }

  async setIntegrationEnabled(
    key: string,
    enabled: boolean,
    actorUserId: string | null = null
  ): Promise<Result<IntegrationProviderDetail, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key } });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const newStatus = enabled ? IntegrationStatusEnum.CONFIGURED : IntegrationStatusEnum.DISABLED;
    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    await getAuditLogService().record({
      eventType: AuditEventType.INTEGRATION_CONFIG_CHANGED,
      actorUserId,
      details: { providerKey: key, enabled },
    });

    return this.getByKey(key);
  }

  async resetCredentials(key: string, actorUserId: string | null = null): Promise<Result<IntegrationProviderDetail, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    // Delete all stored secrets
    await prisma.integrationSecret.deleteMany({ where: { providerId: row.id } });

    // Reset status to NOT_CONFIGURED and clear test results
    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        config: {},
        status: IntegrationStatusEnum.NOT_CONFIGURED,
        lastTestOk: null,
        lastTestedAt: null,
        lastTestMessage: null,
        updatedAt: new Date(),
      },
    });

    await getAuditLogService().record({
      eventType: AuditEventType.INTEGRATION_CONFIG_CHANGED,
      actorUserId,
      details: { providerKey: key, action: "credentials_reset" },
    });

    return this.getByKey(key);
  }

  async getConnectionHistory(
    key: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Result<{ entries: Array<{
    id: string;
    timestamp: string;
    operation: string;
    success: boolean;
    durationMs: number;
    httpStatus: number | null;
    summary: string;
    errorMessage: string | null;
  }>; total: number }, AppError>> {
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    // For now, build history from audit logs (future: dedicated connectionHistory table)
    const entries: Array<{
      id: string;
      timestamp: string;
      operation: string;
      success: boolean;
      durationMs: number;
      httpStatus: number | null;
      summary: string;
      errorMessage: string | null;
    }> = [];
    return ok({ entries, total: 0 });
  }

  async getHealthStatus(key: string): Promise<Result<{
    status: string;
    isAuthValid: boolean;
    lastCheckAt: string | null;
    responseTimeMs: number | null;
    consecutiveFailures: number;
  }, AppError>> {
    const row = await prisma.integrationProvider.findUnique({
      where: { key },
      include: { secrets: true },
    });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const config = asConfig(row.config);
    const fields = fieldsFor(key, config);
    const secretKeys = new Set(row.secrets.map((s) => s.fieldKey));
    const isAuthValid = vaultCredentialsSatisfied(key, fields, secretKeys, config);

    const status = effectiveStatus(row.status, row.lastTestOk, isAuthValid);

    return ok({
      status,
      isAuthValid,
      lastCheckAt: toIso(row.lastTestedAt),
      responseTimeMs: (row.config as any)?.responseTimeMs ?? null,
      consecutiveFailures: (row.config as any)?.consecutiveFailures ?? 0,
    });
  }
}
