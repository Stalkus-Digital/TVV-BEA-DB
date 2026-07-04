import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const runtimeEnvSchema = {
  retryMaxAttempts: { key: "SUPPLIER_RUNTIME_RETRY_MAX_ATTEMPTS", type: "number", default: 3 },
  retryBaseDelayMs: { key: "SUPPLIER_RUNTIME_RETRY_BASE_DELAY_MS", type: "number", default: 200 },
  retryMaxDelayMs: { key: "SUPPLIER_RUNTIME_RETRY_MAX_DELAY_MS", type: "number", default: 5_000 },
  retryJitter: { key: "SUPPLIER_RUNTIME_RETRY_JITTER", type: "boolean", default: true },

  timeoutHotelsMs: { key: "SUPPLIER_RUNTIME_TIMEOUT_HOTELS_MS", type: "number", default: 8_000 },
  timeoutFlightsMs: { key: "SUPPLIER_RUNTIME_TIMEOUT_FLIGHTS_MS", type: "number", default: 8_000 },
  timeoutBookingMs: { key: "SUPPLIER_RUNTIME_TIMEOUT_BOOKING_MS", type: "number", default: 15_000 },
  timeoutCancellationMs: { key: "SUPPLIER_RUNTIME_TIMEOUT_CANCELLATION_MS", type: "number", default: 10_000 },
  timeoutDefaultMs: { key: "SUPPLIER_RUNTIME_TIMEOUT_DEFAULT_MS", type: "number", default: 10_000 },

  breakerFailureThreshold: { key: "SUPPLIER_RUNTIME_BREAKER_FAILURE_THRESHOLD", type: "number", default: 5 },
  breakerCooldownMs: { key: "SUPPLIER_RUNTIME_BREAKER_COOLDOWN_MS", type: "number", default: 30_000 },
  breakerSuccessThreshold: { key: "SUPPLIER_RUNTIME_BREAKER_SUCCESS_THRESHOLD", type: "number", default: 2 },
} satisfies EnvSchema;

export interface RuntimeConfigValues {
  retryMaxAttempts: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  retryJitter: boolean;
  timeoutHotelsMs: number;
  timeoutFlightsMs: number;
  timeoutBookingMs: number;
  timeoutCancellationMs: number;
  timeoutDefaultMs: number;
  breakerFailureThreshold: number;
  breakerCooldownMs: number;
  breakerSuccessThreshold: number;
}

function loadRuntimeConfig(source: Record<string, string | undefined> = process.env): RuntimeConfigValues {
  const result = validateEnv(runtimeEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid supplier runtime environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * Every knob "No hardcoded values" (this sprint's explicit Retry Policy
 * instruction, extended here to timeouts and the circuit breaker too)
 * reads through this — same singleton `getInstance()`/`.get(key)` pattern
 * as `StorageConfigService`/`AuthConfigService`. All defaults are
 * reasonable, safe starting points, not silent no-ops — every one is
 * overridable via environment without touching code.
 */
export class RuntimeConfigService {
  private static instance: RuntimeConfigService | null = null;
  private readonly values: RuntimeConfigValues;

  private constructor() {
    this.values = loadRuntimeConfig();
  }

  static getInstance(): RuntimeConfigService {
    if (!RuntimeConfigService.instance) RuntimeConfigService.instance = new RuntimeConfigService();
    return RuntimeConfigService.instance;
  }

  get<K extends keyof RuntimeConfigValues>(key: K): RuntimeConfigValues[K] {
    return this.values[key];
  }
}
