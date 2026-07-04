import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const corsEnvSchema = {
  /**
   * Comma-separated list of exact origins (`scheme://host[:port]`, no
   * trailing slash, no path) allowed to make cross-origin requests to this
   * API. Defaults to the known local Website frontend dev port only —
   * safe for local development, but MUST be overridden with the real
   * production frontend origin(s) before any non-local deployment. Never
   * "*" — this project's docs/37 audit found the browser blocks every
   * cross-origin authenticated call without this being correctly set, and
   * a wildcard would defeat the point of allow-listing in the first place
   * (also incompatible with `Access-Control-Allow-Credentials: true`,
   * which the CORS spec forbids pairing with a wildcard origin).
   */
  allowedOrigins: { key: "CORS_ALLOWED_ORIGINS", type: "string", default: "http://localhost:3001" },
} satisfies EnvSchema;

export interface CorsConfigValues {
  allowedOrigins: string;
}

function loadCorsConfig(source: Record<string, string | undefined> = process.env): CorsConfigValues {
  const result = validateEnv(corsEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid CORS environment configuration: ${details}`);
  }
  return result.values;
}

/** Same singleton `getInstance()`/`.get(key)` pattern as every other module-level config service in this project. */
export class CorsConfigService {
  private static instance: CorsConfigService | null = null;
  private readonly allowedOrigins: ReadonlySet<string>;

  private constructor(values: CorsConfigValues) {
    this.allowedOrigins = new Set(
      values.allowedOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    );
  }

  static getInstance(): CorsConfigService {
    if (!CorsConfigService.instance) {
      CorsConfigService.instance = new CorsConfigService(loadCorsConfig());
    }
    return CorsConfigService.instance;
  }

  isAllowedOrigin(origin: string): boolean {
    return this.allowedOrigins.has(origin);
  }
}
