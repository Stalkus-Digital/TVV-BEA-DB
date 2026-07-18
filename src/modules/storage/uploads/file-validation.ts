import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { StorageCategory } from "../types/storage-category";
import { StorageConfigService } from "../services/storage-config.service";

const IMAGE_CATEGORIES: readonly StorageCategory[] = [
  StorageCategory.PROFILE_IMAGE,
  StorageCategory.PACKAGE_IMAGE,
  StorageCategory.DESTINATION_IMAGE,
  StorageCategory.GALLERY_IMAGE,
];

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_DOCUMENT_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const EXT_TO_IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const WEAK_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);

export function isImageCategory(category: StorageCategory): boolean {
  return IMAGE_CATEGORIES.includes(category);
}

/** Prefer a real image MIME from the filename when the browser sends a blank/generic type. */
export function resolveImageContentType(contentType: string | null | undefined, fileName: string): string {
  const raw = (contentType ?? "").trim().toLowerCase();
  if (raw === "image/jpg") return "image/jpeg";
  if (ALLOWED_IMAGE_MIME_TYPES.has(raw)) return raw;

  const ext = fileName.split(".").pop()?.trim().toLowerCase() ?? "";
  if (WEAK_MIME_TYPES.has(raw) || !raw.startsWith("image/")) {
    const fromExt = EXT_TO_IMAGE_MIME[ext];
    if (fromExt) return fromExt;
  }

  return raw;
}

export interface FileValidationInput {
  category: StorageCategory;
  contentType: string;
  size: number;
}

/**
 * The one place mime-type/size rules are decided for every upload — the
 * `images/` and `documents/` validators both delegate here rather than
 * re-deciding limits per category.
 */
export function validateFile(input: FileValidationInput): Result<void, AppError> {
  const config = StorageConfigService.getInstance();
  const isImage = isImageCategory(input.category);
  const allowedMimeTypes = isImage ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_DOCUMENT_MIME_TYPES;
  const maxSize = isImage ? config.get("maxImageSizeBytes") : config.get("maxDocumentSizeBytes");

  if (input.size <= 0) {
    return err(new ValidationError("File is empty"));
  }

  const contentType = input.contentType.trim().toLowerCase();
  if (contentType === "image/heic" || contentType === "image/heif") {
    return err(
      new ValidationError(
        "HEIC/HEIF photos are not supported. Please export or convert the image to JPG or PNG and try again."
      )
    );
  }

  if (!allowedMimeTypes.has(contentType)) {
    return err(
      new ValidationError(
        `Content type "${input.contentType || "unknown"}" is not allowed. Use JPG, PNG, WEBP, or GIF (max ${Math.round(maxSize / (1024 * 1024))}MB).`
      )
    );
  }
  if (input.size > maxSize) {
    return err(
      new ValidationError(
        `File is too large (${Math.round(input.size / (1024 * 1024))}MB). Max size is ${Math.round(maxSize / (1024 * 1024))}MB.`
      )
    );
  }
  return ok(undefined);
}
