import { adminApiClient } from "@/lib/admin-api/client";
import type { IntegrationProviderDetail, IntegrationProviderSummary, WebhookEventRow } from "../types";

export async function fetchIntegrations(): Promise<IntegrationProviderSummary[]> {
  const result = await adminApiClient.get<IntegrationProviderSummary[]>("/api/admin/integrations");
  return result ?? [];
}

export async function fetchIntegration(key: string): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.get<IntegrationProviderDetail>(
    `/api/admin/integrations/${encodeURIComponent(key)}`
  );
  if (!result) throw new Error("Integration not found");
  return result;
}

export async function updateIntegration(
  key: string,
  body: { config?: Record<string, unknown>; secrets?: Record<string, string>; status?: string }
): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.put<IntegrationProviderDetail>(
    `/api/admin/integrations/${encodeURIComponent(key)}`,
    body
  );
  if (!result) throw new Error("Failed to update integration");
  return result;
}

export async function testIntegration(
  key: string,
  body: { config?: Record<string, unknown>; secrets?: Record<string, string> } = {}
): Promise<{ ok: boolean; message: string }> {
  const result = await adminApiClient.post<{ ok: boolean; message: string }>(
    `/api/admin/integrations/${encodeURIComponent(key)}/test`,
    body
  );
  if (!result) throw new Error("Test failed");
  return result;
}

export async function setActivePaymentProvider(activeProvider: "razorpay" | "phonepe"): Promise<{ activeProvider: string }> {
  const result = await adminApiClient.post<{ activeProvider: string }>(
    "/api/admin/integrations/payments/active",
    { activeProvider }
  );
  if (!result) throw new Error("Failed to set active payment provider");
  return result;
}

export async function createFerryOperator(input: { code: string; name: string }): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.post<IntegrationProviderDetail>("/api/admin/integrations", {
    type: "ferry",
    ...input,
  });
  if (!result) throw new Error("Failed to create ferry operator");
  return result;
}

export async function fetchWebhookEvents(): Promise<WebhookEventRow[]> {
  const result = await adminApiClient.get<WebhookEventRow[]>("/api/admin/integrations/webhooks/events");
  return result ?? [];
}
