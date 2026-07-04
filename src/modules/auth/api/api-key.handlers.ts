import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getApiKeyService } from "../module";
import type { ApiKey } from "../types/api-key";

export async function listApiKeysHandler(): Promise<Result<ApiKey[], AppError>> {
  return getApiKeyService().list();
}

export async function createApiKeyHandler(body: unknown): Promise<Result<{ apiKey: ApiKey; rawKey: string }, AppError>> {
  return getApiKeyService().create(body);
}

export async function revokeApiKeyHandler(id: string): Promise<Result<ApiKey, AppError>> {
  return getApiKeyService().revoke(id);
}
