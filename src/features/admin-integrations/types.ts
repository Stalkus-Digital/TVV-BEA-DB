export type IntegrationCategory =
  | "AI"
  | "PAYMENTS"
  | "SUPPLIERS"
  | "EMAIL"
  | "SECURITY"
  | "WEBHOOKS"
  | "FERRY";

export interface SecretFieldMeta {
  fieldKey: string;
  configured: boolean;
  lastFour: string | null;
  updatedAt: string | null;
}

export interface ProviderFieldSchema {
  key: string;
  label: string;
  kind: "secret" | "text" | "url" | "boolean";
  secret: boolean;
  required?: boolean;
  placeholder?: string;
}

export interface IntegrationProviderSummary {
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
  secretsConfigured: number;
  secretsTotal: number;
  secretFields: SecretFieldMeta[];
}

export interface IntegrationWebhookRecord {
  id: string;
  providerId: string;
  eventType: string;
  path: string;
  isActive: boolean;
}

export interface IntegrationProviderDetail extends IntegrationProviderSummary {
  fields: ProviderFieldSchema[];
  webhooks: IntegrationWebhookRecord[];
  publicConfig: Record<string, unknown>;
}

export interface WebhookEventRow {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

export const CATEGORY_TABS: Array<{ id: IntegrationCategory | "ALL"; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "AI", label: "AI" },
  { id: "PAYMENTS", label: "Payments" },
  { id: "SUPPLIERS", label: "Suppliers" },
  { id: "FERRY", label: "Ferry" },
  { id: "EMAIL", label: "Email" },
  { id: "SECURITY", label: "Security" },
  { id: "WEBHOOKS", label: "Webhooks" },
];
