import { validateEnv, type EnvSchema } from "@/shared/validation";

/**
 * Only enabled/disabled flags exist today — no supplier makes a real call
 * yet, so there are no API keys or secrets to read. Real credentials
 * (TRIPJACK_API_KEY, etc.) get added here — never hardcoded, never in
 * source — only when a supplier is actually implemented.
 */
const supplierEnvSchema = {
  tripjackEnabled: { key: "TRIPJACK_ENABLED", type: "boolean", default: true },
  ferryEnabled: { key: "FERRY_ENABLED", type: "boolean", default: true },
  manualSupplierEnabled: { key: "MANUAL_SUPPLIER_ENABLED", type: "boolean", default: true },
} satisfies EnvSchema;

export interface SupplierModuleConfig {
  tripjackEnabled: boolean;
  ferryEnabled: boolean;
  manualSupplierEnabled: boolean;
}

function loadSupplierModuleConfig(source: Record<string, string | undefined> = process.env): SupplierModuleConfig {
  const result = validateEnv(supplierEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid supplier module environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * The Supplier module's own config accessor — built the same way
 * src/shared/config/config.service.ts is, per docs/CODING_CONVENTIONS.md §5
 * ("don't add module-specific keys to the shared AppConfig"). Every
 * supplier reads its config through this, never through process.env
 * directly and never with a hardcoded fallback value for a real secret.
 */
export class SupplierConfigService {
  private static instance: SupplierConfigService | undefined;
  private readonly config: SupplierModuleConfig;

  private constructor(config: SupplierModuleConfig) {
    this.config = config;
  }

  static getInstance(): SupplierConfigService {
    if (!SupplierConfigService.instance) {
      SupplierConfigService.instance = new SupplierConfigService(loadSupplierModuleConfig());
    }
    return SupplierConfigService.instance;
  }

  get<K extends keyof SupplierModuleConfig>(key: K): SupplierModuleConfig[K] {
    return this.config[key];
  }

  getAll(): Readonly<SupplierModuleConfig> {
    return this.config;
  }
}
