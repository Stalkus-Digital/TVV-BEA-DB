import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { StorageCategory } from "../types/storage-category";
import { StorageConfigService } from "../services/storage-config.service";
import { detectContentType } from "./magic-bytes";

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
  /** Raw file bytes — required for magic-byte content verification (SECURITY-002C). */
  buffer: Buffer;
}

const MIN_FILE_SIZE_BYTES = 16;

/**
 * The one place mime-type/size/content rules are decided for every upload
 * — the `images/` and `documents/` validators both delegate here rather
 * than re-deciding limits per category.
 *
 * SECURITY-002C: the declared `contentType` (from the browser, or the
 * filename-derived guess in `resolveImageContentType`) is never trusted on
 * its own — it only sets which allowlist/size-limit applies. The file's
 * actual bytes must independently match one of the 5 signatures this app
 * accepts (see magic-bytes.ts) AND match the declared type specifically,
 * closing the classic "virus.exe renamed to image.jpg" bypass: renaming
 * gets the extension/Content-Type past the first check, but the magic-byte
 * signature still reads as whatever the file actually is (or nothing
 * recognized at all), and is rejected either way.
 */
export function validateFile(input: FileValidationInput): Result<void, AppError> {
  const config = StorageConfigService.getInstance();
  const isImage = isImageCategory(input.category);
  const allowedMimeTypes = isImage ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_DOCUMENT_MIME_TYPES;
  const maxSize = isImage ? config.get("maxImageSizeBytes") : config.get("maxDocumentSizeBytes");

  if (input.size <= 0) {
    return err(new ValidationError("File is empty"));
  }
  if (input.size < MIN_FILE_SIZE_BYTES) {
    return err(new ValidationError("File is too small to be a valid upload"));
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

  const detected = detectContentType(input.buffer);
  if (detected === null) {
    return err(
      new ValidationError(
        "This file's content does not match any supported format (JPG, PNG, WEBP, GIF, or PDF). It may be corrupted, empty, or a different file type than its name suggests."
      )
    );
  }
  if (detected !== contentType) {
    return err(
      new ValidationError(
        `This file's actual content is "${detected}", not "${contentType}" as declared. The file extension or type may have been changed.`
      )
    );
  }

  return ok(undefined);
}
