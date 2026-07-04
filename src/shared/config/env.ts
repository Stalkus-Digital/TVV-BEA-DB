import { validateEnv, type EnvSchema } from "../validation/env.schema";

/**
 * The application has no real environment variables in use yet (see
 * docs/01_CURRENT_SYSTEM_AUDIT.md — no .env, no process.env usage anywhere
 * in src/ before this foundation). This schema intentionally stays minimal;
 * future modules define and validate their own env vars the same way,
 * through validateEnv(), rather than adding ad hoc process.env reads.
 */
const appEnvSchema = {
  nodeEnv: { key: "NODE_ENV", type: "string", default: "development" },
  logLevel: { key: "LOG_LEVEL", type: "string", default: "info" },
} satisfies EnvSchema;

export interface AppConfig {
  nodeEnv: string;
  logLevel: string;
}

export function loadAppConfig(source: Record<string, string | undefined> = process.env): AppConfig {
  const result = validateEnv(appEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.values;
}
