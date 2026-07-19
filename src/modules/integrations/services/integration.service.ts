import { prisma } from "@/shared/database/prisma-client";
import { err, ok, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { BaseService, type ServiceContext } from "@/shared/services";
import {
  BUILTIN_PROVIDERS,
  ferryOperatorDefinition,
  getBuiltinDefinition,
} from "../catalog/builtin-providers";
import { decryptSecret, encryptSecret, lastFour } from "../crypto/secret-vault";
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

export class IntegrationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async ensureSeeded(): Promise<void> {
    for (const def of BUILTIN_PROVIDERS) {
      const existing = await prisma.integrationProvider.findUnique({ where: { key: def.key } });
      if (existing) {
        // Keep webhooks in sync for builtins
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

    // Mark connected if env already has required secrets
    await this.refreshStatusesFromEnv();
  }

  private async refreshStatusesFromEnv(): Promise<void> {
    const providers = await prisma.integrationProvider.findMany();
    for (const provider of providers) {
      const fields = fieldsFor(provider.key, asConfig(provider.config));
      if (fields.length === 0) continue;
      const secrets = await prisma.integrationSecret.findMany({ where: { providerId: provider.id } });
      const secretKeys = new Set(secrets.map((s) => s.fieldKey));
      const required = fields.filter((f) => f.required);
      const satisfied = required.every((f) => {
        if (secretKeys.has(f.key)) return true;
        if (f.envFallback && process.env[f.envFallback]) return true;
        if (!f.secret) {
          const cfg = asConfig(provider.config);
          if (cfg[f.key] !== undefined && cfg[f.key] !== null && cfg[f.key] !== "") return true;
        }
        return false;
      });
      const nextStatus = satisfied ? IntegrationStatus.CONNECTED : IntegrationStatus.DISCONNECTED;
      if (provider.status !== nextStatus && provider.status !== IntegrationStatus.DISABLED) {
        await prisma.integrationProvider.update({
          where: { id: provider.id },
          data: { status: nextStatus },
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
      const secretFields: IntegrationSecretMeta[] = fields
        .filter((f) => f.secret)
        .map((f) => {
          const stored = row.secrets.find((s) => s.fieldKey === f.key);
          const envSet = Boolean(f.envFallback && process.env[f.envFallback]);
          return {
            fieldKey: f.key,
            configured: Boolean(stored) || envSet,
            lastFour: stored?.lastFour ?? (envSet ? "env" : null),
            updatedAt: toIso(stored?.updatedAt),
          };
        });
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
    const secretFields: IntegrationSecretMeta[] = fields
      .filter((f) => f.secret)
      .map((f) => {
        const stored = row.secrets.find((s) => s.fieldKey === f.key);
        const envSet = Boolean(f.envFallback && process.env[f.envFallback]);
        return {
          fieldKey: f.key,
          configured: Boolean(stored) || envSet,
          lastFour: stored?.lastFour ?? (envSet ? "env" : null),
          updatedAt: toIso(stored?.updatedAt),
        };
      });

    const publicConfig: Record<string, unknown> = { ...asConfig(row.config) };
    for (const f of fields) {
      if (!f.secret && publicConfig[f.key] === undefined && f.envFallback && process.env[f.envFallback]) {
        publicConfig[f.key] = process.env[f.envFallback];
      }
    }

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
    input: { config?: Record<string, unknown>; secrets?: Record<string, string>; status?: string }
  ): Promise<Result<IntegrationProviderDetail, AppError>> {
    await this.ensureSeeded();
    const row = await prisma.integrationProvider.findUnique({ where: { key } });
    if (!row) return err(new NotFoundError(`Integration "${key}" not found`));

    const fields = fieldsFor(key, asConfig(row.config));
    const nextConfig = { ...asConfig(row.config), ...(input.config ?? {}) };

    // Move non-secret field values from secrets payload into config if mis-sent
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
      }
    }

    // Persist non-secret config fields from input.config
    for (const f of fields) {
      if (!f.secret && input.config && input.config[f.key] !== undefined) {
        nextConfig[f.key] = input.config[f.key];
      }
    }

    let status = input.status ?? row.status;
    if (status !== IntegrationStatus.DISABLED) {
      // Recompute connectedness after save
      const secrets = await prisma.integrationSecret.findMany({ where: { providerId: row.id } });
      const secretKeys = new Set(secrets.map((s) => s.fieldKey));
      const required = fields.filter((f) => f.required);
      const satisfied = required.every((f) => {
        if (f.secret) return secretKeys.has(f.key) || Boolean(f.envFallback && process.env[f.envFallback]);
        const v = nextConfig[f.key];
        return (v !== undefined && v !== null && v !== "") || Boolean(f.envFallback && process.env[f.envFallback]);
      });
      status = satisfied || fields.length === 0 ? IntegrationStatus.CONNECTED : IntegrationStatus.DISCONNECTED;
    }

    await prisma.integrationProvider.update({
      where: { id: row.id },
      data: {
        config: nextConfig as object,
        status,
        updatedAt: new Date(),
      },
    });

    return this.getByKey(key);
  }

  async setActivePaymentProvider(provider: "razorpay" | "phonepe"): Promise<Result<{ activeProvider: string }, AppError>> {
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
    const resolved = await this.resolveProviderValues(key);
    if (!resolved.ok) return resolved;

    let testOk = false;
    let message = "Not tested";

    try {
      switch (key) {
        case "openai": {
          const apiKey = resolved.value.apiKey;
          if (!apiKey) throw new Error("OpenAI API key is not configured");
          const res = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (!res.ok) throw new Error(`OpenAI responded ${res.status}`);
          testOk = true;
          message = "OpenAI API key is valid";
          break;
        }
        case "razorpay": {
          const keyId = resolved.value.keyId;
          const keySecret = resolved.value.keySecret;
          if (!keyId || !keySecret) throw new Error("Razorpay credentials incomplete");
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
          if (!resolved.value.merchantId || !resolved.value.saltKey) {
            throw new Error("PhonePe merchantId and saltKey are required");
          }
          testOk = true;
          message = "PhonePe credentials are saved (live ping skipped — use a test payment to verify)";
          break;
        }
        case "smtp": {
          if (!resolved.value.host || !resolved.value.user || !resolved.value.pass) {
            throw new Error("SMTP host, user, and password are required");
          }
          testOk = true;
          message = "SMTP settings look complete (send a test email from auth flow to verify delivery)";
          break;
        }
        case "tripjack": {
          if (!resolved.value.token && !(resolved.value.agencyId && resolved.value.password)) {
            throw new Error("TripJack needs a token or agency login credentials");
          }
          testOk = true;
          message = "TripJack credentials are present";
          break;
        }
        case "recaptcha": {
          if (!resolved.value.siteKey || !resolved.value.secretKey) {
            throw new Error("reCAPTCHA site key and secret key are required");
          }
          testOk = true;
          message = "reCAPTCHA keys are configured";
          break;
        }
        default: {
          testOk = true;
          message = "Configuration saved";
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
   * Resolve all field values for a provider: DB secret → config → env fallback.
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

    // Also expose non-field config keys as strings
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
