import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const corsEnvSchema = {
  /**
   * Comma-separated list of exact origins (`scheme://host[:port]`, no
   * trailing slash, no path) allowed to make cross-origin requests to this
   * API. Defaults to local Website frontend + the Vercel production site.
   * Override with CORS_ALLOWED_ORIGINS for additional custom domains. Never
   * "*" — incompatible with `Access-Control-Allow-Credentials: true`.
   */
  allowedOrigins: {
    key: "CORS_ALLOWED_ORIGINS",
    type: "string",
    default: "http://localhost:3001,https://tvv-frontend-final.vercel.app",
  },
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
    const origins = new Set(
      values.allowedOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    );
    // Ensure production website can call the API even if Vercel env still
    // only lists localhost (common misconfig after the default was localhost-only).
    origins.add("https://tvv-frontend-final.vercel.app");
    origins.add("http://localhost:3001");
    this.allowedOrigins = origins;
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
