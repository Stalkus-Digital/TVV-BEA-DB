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

export async function deleteIntegration(key: string): Promise<{ deleted: boolean }> {
  const result = await adminApiClient.delete<{ deleted: boolean }>(
    `/api/admin/integrations/${encodeURIComponent(key)}`
  );
  if (!result) throw new Error("Failed to delete integration");
  return result;
}

export async function enableIntegration(key: string): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.post<IntegrationProviderDetail>(
    `/api/admin/integrations/${encodeURIComponent(key)}/enable`,
    {}
  );
  if (!result) throw new Error("Failed to enable integration");
  return result;
}

export async function disableIntegration(key: string): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.post<IntegrationProviderDetail>(
    `/api/admin/integrations/${encodeURIComponent(key)}/disable`,
    {}
  );
  if (!result) throw new Error("Failed to disable integration");
  return result;
}

export async function resetCredentials(key: string): Promise<IntegrationProviderDetail> {
  const result = await adminApiClient.post<IntegrationProviderDetail>(
    `/api/admin/integrations/${encodeURIComponent(key)}/reset`,
    {}
  );
  if (!result) throw new Error("Failed to reset credentials");
  return result;
}

export async function getHealthStatus(key: string): Promise<{
  status: string;
  isAuthValid: boolean;
  lastCheckAt: string | null;
  responseTimeMs: number | null;
  consecutiveFailures: number;
}> {
  const result = await adminApiClient.get<{
    status: string;
    isAuthValid: boolean;
    lastCheckAt: string | null;
    responseTimeMs: number | null;
    consecutiveFailures: number;
  }>(`/api/admin/integrations/${encodeURIComponent(key)}/health`);
  if (!result) throw new Error("Failed to get health status");
  return result;
}

export async function getConnectionHistory(
  key: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  entries: Array<{
    id: string;
    timestamp: string;
    operation: string;
    success: boolean;
    durationMs: number;
    httpStatus: number | null;
    summary: string;
    errorMessage: string | null;
  }>;
  total: number;
}> {
  const result = await adminApiClient.get<{
    entries: Array<{
      id: string;
      timestamp: string;
      operation: string;
      success: boolean;
      durationMs: number;
      httpStatus: number | null;
      summary: string;
      errorMessage: string | null;
    }>;
    total: number;
  }>(
    `/api/admin/integrations/${encodeURIComponent(key)}/history?limit=${limit}&offset=${offset}`
  );
  if (!result) throw new Error("Failed to get connection history");
  return result;
}
