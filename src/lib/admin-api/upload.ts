import { adminEndpoints } from "./endpoints";
import { getAccessToken, clearTokens } from "./token";
import { adminApiClient } from "./client";

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

  const res = await adminApiClient.request<UploadResult>(adminEndpoints.storage.upload, {
    method: "POST",
    body: formData,
  });

  if (!res) {
    throw new Error("Upload failed (no response)");
  }

  return res;
}

export async function uploadFiles(files: File[], category: string = "general"): Promise<UploadResult[]> {
  return Promise.all(files.map(file => uploadFile(file, category)));
}
