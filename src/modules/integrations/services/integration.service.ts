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
  IntegrationStatus,
  SYSTEM_PAYMENTS_KEY,
  type IntegrationProviderDetail,
  type IntegrationProviderSummary,
  type IntegrationSecretMeta,
  type IntegrationWebhookRecord,
  type ProviderFieldSchema,
} from "../types/integration";

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
          status: IntegrationStatus.DISCONNECTED,
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
      if (provider.status === IntegrationStatus.DISABLED) continue;

      const config = asConfig(provider.config);
      const fields = fieldsFor(provider.key, config);
      if (fields.length === 0) continue;

      const secretKeys = new Set(provider.secrets.map((s) => s.fieldKey));
      const vaultOk = vaultCredentialsSatisfied(provider.key, fields, secretKeys, config);

      let nextStatus: string;
      if (!vaultOk) {
        nextStatus = IntegrationStatus.DISCONNECTED;
      } else if (provider.lastTestOk === true) {
        nextStatus = IntegrationStatus.CONNECTED;
      } else if (provider.lastTestOk === false) {
        nextStatus = IntegrationStatus.ERROR;
      } else {
        nextStatus = IntegrationStatus.DISCONNECTED;
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
      const fields = fieldsFor(row.key, asConfig(row.config));
      const secretFields = vaultSecretMeta(fields, row.secrets);
      const secretsTotal = secretFields.length;
      const secretsConfigured = secretFields.filter((s) => s.configured).length;
      return {
        id: row.id,
        key: row.key,
        category: row.category,
        name: row.name,
        description: row.description,
        isBuiltin: row.isBuiltin,
        status: row.status,
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

    const fields = fieldsFor(row.key, asConfig(row.config));
    const secretFields = vaultSecretMeta(fields, row.secrets);

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
      status: row.status,
      config: asConfig(row.config),
      lastTestedAt: toIso(row.lastTestedAt),
      lastTestOk: row.lastTestOk,
      lastTestMessage: row.lastTestMessage,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      secretsConfigured: secretFields.filter((s) => s.configured).length,
      secretsTotal: secretFields.length,
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

    let status = input.status ?? row.status;
    let clearTest = false;
    if (status !== IntegrationStatus.DISABLED) {
      if (!vaultOk) {
        status = IntegrationStatus.DISCONNECTED;
        clearTest = true;
      } else if (credentialsTouched) {
        // Must re-test after changing credentials
        status = IntegrationStatus.DISCONNECTED;
        clearTest = true;
      } else if (row.lastTestOk === true) {
        status = IntegrationStatus.CONNECTED;
      } else {
        status = IntegrationStatus.DISCONNECTED;
      }
    }

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
    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        config: { [ACTIVE_PAYMENT_CONFIG_KEY]: provider },
        status: IntegrationStatus.CONNECTED,
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
        status: IntegrationStatus.DISCONNECTED,
        config: { name: input.name.trim(), code },
      },
    });
    return this.getByKey(key);
  }

  async testConnection(key: string): Promise<Result<{ ok: boolean; message: string }, AppError>> {
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

    let testOk = false;
    let message = "Not tested";

    try {
      switch (key) {
        case "openai": {
          const apiKey = vaultOnly.value.apiKey;
          if (!apiKey) throw new Error("OpenAI API key is not saved in Integrations");
          const res = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (!res.ok) throw new Error(`OpenAI responded ${res.status}`);
          testOk = true;
          message = "OpenAI API key is valid";
          break;
        }
        case "razorpay": {
          const keyId = vaultOnly.value.keyId;
          const keySecret = vaultOnly.value.keySecret;
          if (!keyId || !keySecret) throw new Error("Razorpay credentials incomplete in Integrations");
          const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
          const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
            headers: { Authorization: `Basic ${auth}` },
          });
          if (!res.ok) throw new Error(`Razorpay responded ${res.status}`);
          testOk = true;
          message = "Razorpay credentials are valid";
          break;
        }
        case "phonepe": {
          if (!vaultOnly.value.merchantId || !vaultOnly.value.saltKey || !vaultOnly.value.saltIndex) {
            throw new Error("PhonePe merchantId, saltKey, and saltIndex are required in Integrations");
          }
          testOk = true;
          message = "PhonePe credentials are saved (live ping skipped — use a test payment to verify)";
          break;
        }
        case "smtp": {
          if (!vaultOnly.value.host || !vaultOnly.value.user || !vaultOnly.value.pass) {
            throw new Error("SMTP host, user, and password are required in Integrations");
          }
          testOk = true;
          message = "SMTP settings look complete (send a test email from auth flow to verify delivery)";
          break;
        }
        case "tripjack": {
          const hasToken = Boolean(vaultOnly.value.token);
          const hasAgency =
            Boolean(vaultOnly.value.agencyId) &&
            Boolean(vaultOnly.value.userId) &&
            Boolean(vaultOnly.value.password);
          if (!vaultOnly.value.apiUrl) throw new Error("TripJack API URL is required");
          if (!hasToken && !hasAgency) {
            throw new Error("TripJack needs a token or agency login credentials saved in Integrations");
          }
          testOk = true;
          message = "TripJack credentials are present";
          break;
        }
        case "recaptcha": {
          if (!vaultOnly.value.siteKey || !vaultOnly.value.secretKey) {
            throw new Error("reCAPTCHA site key and secret key are required in Integrations");
          }
          testOk = true;
          message = "reCAPTCHA keys are configured";
          break;
        }
        case "sembark": {
          if (!vaultOnly.value.apiUrl || !vaultOnly.value.apiKey) {
            throw new Error("Sembark API URL and API key are required in Integrations");
          }
          testOk = true;
          message = "Sembark credentials are saved (leads will sync on enquiry submit)";
          break;
        }
        case "cloudinary": {
          if (!vaultOnly.value.cloudName || !vaultOnly.value.apiKey || !vaultOnly.value.apiSecret) {
            throw new Error("Cloudinary cloudName, apiKey, and apiSecret are required in Integrations");
          }
          testOk = true;
          message = "Cloudinary credentials are configured";
          break;
        }
        default: {
          if (key.startsWith("ferry:")) {
            if (!vaultOnly.value.apiBaseUrl || !vaultOnly.value.apiKey) {
              throw new Error("Ferry API base URL and API key are required");
            }
            testOk = true;
            message = "Ferry operator credentials are configured";
            break;
          }
          throw new Error(`No connection test available for "${key}"`);
        }
      }
    } catch (e) {
      testOk = false;
      message = e instanceof Error ? e.message : "Connection test failed";
    }

    await prisma.integrationProvider.update({
      where: { key },
      data: {
        lastTestedAt: new Date(),
        lastTestOk: testOk,
        lastTestMessage: message,
        status: testOk ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
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
}
