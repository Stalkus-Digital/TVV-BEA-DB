import { validateEnv, type EnvSchema } from "@/shared/validation";

const websiteEnvSchema = {
  baseUrl: { key: "WEBSITE_BASE_URL", type: "string", default: "" },
} satisfies EnvSchema;

export interface WebsiteConfigValues {
  baseUrl: string;
}

function loadWebsiteConfig(source: Record<string, string | undefined> = process.env): WebsiteConfigValues {
  const result = validateEnv(websiteEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid website module environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * Own config accessor, same pattern as every other module's (§5 of
 * docs/CODING_CONVENTIONS.md). Empty default — canonical URLs built with an
 * empty base become relative paths, not broken absolute URLs, until
 * WEBSITE_BASE_URL is actually set.
 */
export class WebsiteConfigService {
  private static instance: WebsiteConfigService | undefined;
  private readonly values: WebsiteConfigValues;

  private constructor(values: WebsiteConfigValues) {
    this.values = values;
  }

  static getInstance(): WebsiteConfigService {
    if (!WebsiteConfigService.instance) {
      WebsiteConfigService.instance = new WebsiteConfigService(loadWebsiteConfig());
    }
    return WebsiteConfigService.instance;
  }

  get<K extends keyof WebsiteConfigValues>(key: K): WebsiteConfigValues[K] {
    return this.values[key];
  }
}
