import { adminEndpoints } from "./endpoints";
import { adminApiClient } from "./client";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  sizeBytes: number;
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"]);
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
};

function resolveClientImageType(file: File): string {
  const raw = (file.type || "").toLowerCase();
  if (raw === "image/jpg") return "image/jpeg";
  if (ALLOWED_IMAGE_TYPES.has(raw)) return raw;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? raw;
}

function assertUploadableImage(file: File): void {
  const type = resolveClientImageType(file);
  if (type === "image/heic" || type === "image/heif" || /\.heic$|\.heif$/i.test(file.name)) {
    throw new Error(
      `"${file.name}" is a HEIC/HEIF photo. Convert it to JPG or PNG before uploading.`
    );
  }
  if (!ALLOWED_IMAGE_TYPES.has(type)) {
    throw new Error(
      `"${file.name}" is not a supported image type. Use JPG, PNG, WEBP, GIF, or MP4.`
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`"${file.name}" is larger than 5MB.`);
  }
  if (file.size <= 0) {
    throw new Error(`"${file.name}" is empty.`);
  }
}

export async function uploadFile(file: File, category: string = "general", ownerId?: string): Promise<UploadResult> {
  assertUploadableImage(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("category", category);
  
  // The API requires an ownerId for most categories.
  // If not explicitly provided, we generate a safe temporary one.
  const safeOwnerId = ownerId || `temp_upload_${Date.now()}`;
  formData.append("ownerId", safeOwnerId);

  const res = await adminApiClient.request<UploadResult>(adminEndpoints.storage.upload, {
    method: "POST",
    body: formData,
  });

  if (!res) {
    throw new Error("Upload failed (no response)");
  }

  return res;
}

export async function uploadFiles(files: File[], category: string = "general", ownerId?: string): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const batchSize = 3; // Prevent Serverless timeouts by chunking uploads

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((file) => uploadFile(file, category, ownerId))
    );
    results.push(...batchResults);
  }

  return results;
}
