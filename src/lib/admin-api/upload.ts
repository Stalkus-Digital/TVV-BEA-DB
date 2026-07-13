import { adminEndpoints } from "./endpoints";
import { getAccessToken, clearTokens } from "./token";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  sizeBytes: number;
}

export async function uploadFile(file: File, category: string = "general"): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("category", category);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(adminEndpoints.storage.upload, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    clearTokens();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error?.message || "Upload failed");
  }

  return result.data as UploadResult;
}

export async function uploadFiles(files: File[], category: string = "general"): Promise<UploadResult[]> {
  return Promise.all(files.map(file => uploadFile(file, category)));
}
