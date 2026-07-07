import { unwrapApiData } from "@/lib/admin-api/envelope";
import { fromStatus } from "@/lib/admin-api/errors";
import { getAccessToken } from "@/lib/admin-api/token";
import type { DeleteStorageInput, StorageObject, UploadStorageInput } from "../types";

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

export async function deleteStorageObject(input: DeleteStorageInput): Promise<void> {
  const token = getAccessToken();
  const res = await fetch("/api/storage/delete", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw fromStatus(res.status, await safeJson(res));
}

export async function fetchStorageMetadata(
  category: DeleteStorageInput["category"],
  key: string,
  ownerId: string
): Promise<StorageObject | null> {
  const token = getAccessToken();
  const params = new URLSearchParams({ category, key, ownerId });
  const res = await fetch(`/api/storage/metadata?${params.toString()}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 404) return null;
  if (!res.ok) throw fromStatus(res.status, await safeJson(res));

  const raw = await res.json();
  return unwrapApiData(raw) as StorageObject;
}
