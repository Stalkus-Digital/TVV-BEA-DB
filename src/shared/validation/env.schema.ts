export type EnvVarType = "string" | "number" | "boolean";

export interface EnvVarSpec<T = unknown> {
  key: string;
  type: EnvVarType;
  required?: boolean;
  default?: T;
}

export interface EnvSchema {
  [name: string]: EnvVarSpec;
}

export type InferEnv<S extends EnvSchema> = {
  [K in keyof S]: S[K]["type"] extends "number" ? number : S[K]["type"] extends "boolean" ? boolean : string;
};

export interface EnvValidationError {
  key: string;
  message: string;
}

export type EnvValidationResult<S extends EnvSchema> =
  | { values: InferEnv<S> }
  | { errors: EnvValidationError[] };

function coerce(type: EnvVarType, raw: string): string | number | boolean {
  if (type === "number") {
    const n = Number(raw);
    if (Number.isNaN(n)) throw new Error(`expected a number, got "${raw}"`);
    return n;
  }
  if (type === "boolean") {
    return raw === "true" || raw === "1";
  }
  return raw;
}

/**
 * Generic environment validator every module should use to define and read
 * its own env vars (e.g. a future supplier module defining TRIPJACK_API_KEY).
 * Deliberately dependency-free — no schema library installed for this.
 */
export function validateEnv<S extends EnvSchema>(
  schema: S,
  source: Record<string, string | undefined> = process.env
): EnvValidationResult<S> {
  const errors: EnvValidationError[] = [];
  const values: Record<string, unknown> = {};

  for (const name of Object.keys(schema)) {
    const spec = schema[name];
    const raw = source[spec.key];

    if (raw === undefined || raw === "") {
      if (spec.default !== undefined) {
        values[name] = spec.default;
        continue;
      }
      if (spec.required) {
        errors.push({ key: spec.key, message: `missing required environment variable "${spec.key}"` });
        continue;
      }
      values[name] = undefined;
      continue;
    }

    try {
      values[name] = coerce(spec.type, raw);
    } catch (e) {
      errors.push({ key: spec.key, message: e instanceof Error ? e.message : String(e) });
    }
  }

  if (errors.length > 0) return { errors };
  return { values: values as InferEnv<S> };
}
