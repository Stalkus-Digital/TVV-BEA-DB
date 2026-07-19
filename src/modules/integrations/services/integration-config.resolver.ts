import { getIntegrationService } from "../module";

/**
 * Runtime credential resolver — prefers Integrations vault, then process.env.
 * Safe to call from any module; seeds providers lazily.
 */
export class IntegrationConfigResolver {
  async get(providerKey: string): Promise<Record<string, string>> {
    const result = await getIntegrationService().resolveProviderValues(providerKey);
    if (!result.ok) return {};
    return result.value;
  }

  async getValue(providerKey: string, fieldKey: string, envFallback?: string): Promise<string | undefined> {
    const values = await this.get(providerKey);
    if (values[fieldKey]) return values[fieldKey];
    if (envFallback && process.env[envFallback]) return process.env[envFallback];
    return undefined;
  }

  async getActivePaymentProvider(): Promise<"razorpay" | "phonepe"> {
    return getIntegrationService().getActivePaymentProvider();
  }

  async getOpenAiApiKey(): Promise<string | undefined> {
    return this.getValue("openai", "apiKey", "OPENAI_API_KEY");
  }

  async getRazorpayCredentials(): Promise<{ keyId?: string; keySecret?: string; webhookSecret?: string }> {
    const v = await this.get("razorpay");
    return {
      keyId: v.keyId || process.env.RAZORPAY_KEY_ID,
      keySecret: v.keySecret || process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: v.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET,
    };
  }

  async getPhonePeCredentials(): Promise<{
    merchantId?: string;
    saltKey?: string;
    saltIndex?: string;
    clientId?: string;
    clientSecret?: string;
    baseUrl?: string;
  }> {
    const v = await this.get("phonepe");
    return {
      merchantId: v.merchantId || process.env.PHONEPE_MERCHANT_ID,
      saltKey: v.saltKey || process.env.PHONEPE_SALT_KEY,
      saltIndex: v.saltIndex || process.env.PHONEPE_SALT_INDEX || "1",
      clientId: v.clientId || process.env.PHONEPE_CLIENT_ID,
      clientSecret: v.clientSecret || process.env.PHONEPE_CLIENT_SECRET,
      baseUrl: v.baseUrl || process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox",
    };
  }

  async getSmtpConfig(): Promise<{
    host?: string;
    port?: string;
    secure?: string;
    user?: string;
    pass?: string;
    from?: string;
  }> {
    const v = await this.get("smtp");
    return {
      host: v.host || process.env.SMTP_HOST,
      port: v.port || process.env.SMTP_PORT || "587",
      secure: v.secure || process.env.SMTP_SECURE || "false",
      user: v.user || process.env.SMTP_USER,
      pass: v.pass || process.env.SMTP_PASS,
      from: v.from || process.env.SMTP_FROM,
    };
  }

  async getRecaptchaConfig(): Promise<{ siteKey?: string; secretKey?: string; enabled: boolean }> {
    const v = await this.get("recaptcha");
    const enabledRaw = v.enabled ?? "";
    const enabled = enabledRaw === "true" || enabledRaw === "1" || Boolean(v.siteKey && v.secretKey && enabledRaw !== "false");
    return {
      siteKey: v.siteKey || process.env.RECAPTCHA_SITE_KEY,
      secretKey: v.secretKey || process.env.RECAPTCHA_SECRET_KEY,
      enabled: Boolean(v.siteKey || process.env.RECAPTCHA_SITE_KEY) && enabled,
    };
  }

  async getTripJackConfig(): Promise<Record<string, string>> {
    const v = await this.get("tripjack");
    return {
      apiUrl: v.apiUrl || process.env.TRIPJACK_API_URL || "",
      token: v.token || process.env.TRIPJACK_TOKEN || "",
      agencyId: v.agencyId || process.env.TRIPJACK_AGENCY_ID || "",
      userId: v.userId || process.env.TRIPJACK_USER_ID || "",
      password: v.password || process.env.TRIPJACK_PASSWORD || "",
      enabled: v.enabled || process.env.TRIPJACK_ENABLED || "false",
    };
  }

  async getSembarkConfig(): Promise<Record<string, string>> {
    const v = await this.get("sembark");
    return {
      apiUrl: v.apiUrl || process.env.SEMBARK_API_URL || "",
      apiKey: v.apiKey || process.env.SEMBARK_API_KEY || "",
      webhookSecret: v.webhookSecret || process.env.SEMBARK_WEBHOOK_SECRET || "",
      webhookUrl: v.webhookUrl || process.env.SEMBARK_WEBHOOK_URL || "",
    };
  }

  async getFerryOperatorConfig(operatorCode: string): Promise<Record<string, string>> {
    const key = operatorCode.startsWith("ferry:") ? operatorCode : `ferry:${operatorCode}`;
    return this.get(key);
  }
}

let resolverSingleton: IntegrationConfigResolver | null = null;

export function getIntegrationConfigResolver(): IntegrationConfigResolver {
  if (!resolverSingleton) resolverSingleton = new IntegrationConfigResolver();
  return resolverSingleton;
}
