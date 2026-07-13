import { adminApiClient } from "@/lib/admin-api/client";
import type { ApiKey } from "@/modules/auth/types/api-key";

export async function listApiKeys(): Promise<ApiKey[]> {
  const data = await adminApiClient.get<ApiKey[]>("/api/admin/api-keys");
  return data ?? [];
}

export async function createApiKey(name: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
  const data = await adminApiClient.post<{ apiKey: ApiKey; rawKey: string }>("/api/admin/api-keys", { name });
  if (!data) throw new Error("Failed to create API key");
  return data;
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
  const data = await adminApiClient.delete<ApiKey>(`/api/admin/api-keys/${id}`);
  if (!data) throw new Error("Failed to revoke API key");
  return data;
}
