import { validateEnv, type EnvSchema } from "@/shared/validation";

/**
 * Every value is empty/safe by default — no real secret is ever a fallback
 * literal. This is the ONLY place a TripJack credential may be read from;
 * nothing else in this connector touches process.env directly.
 */
const tripjackEnvSchema = {
  apiUrl: { key: "TRIPJACK_API_URL", type: "string", default: "" },
  agencyId: { key: "TRIPJACK_AGENCY_ID", type: "string", default: "" },
  userId: { key: "TRIPJACK_USER_ID", type: "string", default: "" },
  password: { key: "TRIPJACK_PASSWORD", type: "string", default: "" },
  token: { key: "TRIPJACK_TOKEN", type: "string", default: "" },
  timeoutMs: { key: "TRIPJACK_TIMEOUT_MS", type: "number", default: 15000 },
  retryCount: { key: "TRIPJACK_RETRY_COUNT", type: "number", default: 2 },
} satisfies EnvSchema;

export interface TripJackConfigValues {
  apiUrl: string;
  agencyId: string;
  userId: string;
  password: string;
  token: string;
  timeoutMs: number;
  retryCount: number;
}

function loadTripJackConfig(source: Record<string, string | undefined> = process.env): TripJackConfigValues {
  const result = validateEnv(tripjackEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid TripJack environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * TripJack's own config accessor — one level more specific than the
 * Supplier module's SupplierConfigService, same pattern (validateEnv, own
 * singleton), per docs/CODING_CONVENTIONS.md §5. Nothing is hardcoded; every
 * field comes from the environment, with safe empty defaults.
 */
export class TripJackConfig {
  private static instance: TripJackConfig | undefined;
  private readonly values: TripJackConfigValues;

  private constructor(values: TripJackConfigValues) {
    this.values = values;
  }

  static getInstance(): TripJackConfig {
    if (!TripJackConfig.instance) {
      TripJackConfig.instance = new TripJackConfig(loadTripJackConfig());
    }
    return TripJackConfig.instance;
  }

  get<K extends keyof TripJackConfigValues>(key: K): TripJackConfigValues[K] {
    return this.values[key];
  }

  /** True once real credentials exist. Drives the NOT_CONFIGURED health status. */
  isConfigured(): boolean {
    return Boolean(this.values.apiUrl && this.values.agencyId && this.values.userId && this.values.password);
  }
}
