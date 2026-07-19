export const IntegrationCategory = {
  AI: "AI",
  PAYMENTS: "PAYMENTS",
  SUPPLIERS: "SUPPLIERS",
  EMAIL: "EMAIL",
  SECURITY: "SECURITY",
  WEBHOOKS: "WEBHOOKS",
  FERRY: "FERRY",
} as const;

export type IntegrationCategory = (typeof IntegrationCategory)[keyof typeof IntegrationCategory];

export const IntegrationStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTED: "CONNECTED",
  ERROR: "ERROR",
  DISABLED: "DISABLED",
} as const;

export type IntegrationStatus = (typeof IntegrationStatus)[keyof typeof IntegrationStatus];

export type SecretFieldKind = "secret" | "text" | "url" | "boolean";

export interface ProviderFieldSchema {
  key: string;
  label: string;
  kind: SecretFieldKind;
  /** When true, value is stored encrypted in IntegrationSecret */
  secret: boolean;
  required?: boolean;
  envFallback?: string;
  placeholder?: string;
}

export interface BuiltinProviderDefinition {
  key: string;
  category: IntegrationCategory;
  name: string;
  description: string;
  fields: ProviderFieldSchema[];
  webhooks?: Array<{ eventType: string; path: string }>;
}

export interface IntegrationProviderRecord {
  id: string;
  key: string;
  category: string;
  name: string;
  description: string | null;
  isBuiltin: boolean;
  status: string;
  config: Record<string, unknown> | null;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSecretMeta {
  fieldKey: string;
  configured: boolean;
  lastFour: string | null;
  updatedAt: string | null;
}

export interface IntegrationWebhookRecord {
  id: string;
  providerId: string;
  eventType: string;
  path: string;
  isActive: boolean;
}

export interface IntegrationProviderSummary extends IntegrationProviderRecord {
  secretsConfigured: number;
  secretsTotal: number;
  secretFields: IntegrationSecretMeta[];
}

export interface IntegrationProviderDetail extends IntegrationProviderSummary {
  fields: ProviderFieldSchema[];
  webhooks: IntegrationWebhookRecord[];
  /** Public (non-secret) config values safe to return to admin UI */
  publicConfig: Record<string, unknown>;
}

/** Global payments config stored on a synthetic key `payments.active` via openai-style config — actually on razorpay/phonepe and a Cms-like row. We use provider key `__system` or store on each payment provider. Prefer a dedicated key. */
export const SYSTEM_PAYMENTS_KEY = "payments";
export const ACTIVE_PAYMENT_CONFIG_KEY = "activeProvider";
