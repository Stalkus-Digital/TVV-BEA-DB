import { adminApiClient } from "@/lib/admin-api/client";
import { unwrapApiData } from "@/lib/admin-api/envelope";
import { fromStatus } from "@/lib/admin-api/errors";
import { getAccessToken } from "@/lib/admin-api/token";
import type { SignedUrlResult, StorageCategory, StorageObject, UploadStorageInput } from "../types";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function uploadStorageObject(input: UploadStorageInput): Promise<StorageObject> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("category", input.category);
  formData.append("ownerId", input.ownerId);
  if (input.fileName) formData.append("fileName", input.fileName);

  const token = getAccessToken();
  const res = await fetch("/api/storage/upload", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) throw fromStatus(res.status, await safeJson(res));

  const raw = await res.json();
  return unwrapApiData(raw) as StorageObject;
}

export async function fetchSignedUrl(
  category: StorageCategory,
  key: string,
  ownerId: string,
  ttlSeconds?: number
): Promise<SignedUrlResult> {
  const result = await adminApiClient.get<SignedUrlResult>("/api/storage/signed-url", {
    params: { category, key, ownerId, ttlSeconds },
  });
  if (!result) throw new Error("Failed to generate signed URL");
  return result;
}

export async function fetchStorageMetadata(
  category: StorageCategory,
  key: string,
  ownerId: string
): Promise<StorageObject | null> {
  const result = await adminApiClient.get<StorageObject>("/api/storage/metadata", {
    params: { category, key, ownerId },
    treat404AsNull: true,
  });
  return result;
}
