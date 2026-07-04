import { isErr, ok, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { StorageProvider, ProviderObjectMetadata } from "../providers/storage-provider";
import type { SignedUrlService } from "../signed-urls/signed-url.service";
import { CATEGORY_VISIBILITY, type StorageCategory, type StorageVisibility } from "../types/storage-category";
import type { StorageObject } from "../types/storage-object";
import type { ReplaceOptions, UploadOptions } from "../types/upload-options";
import { generateStorageKey } from "../uploads/key-generator";
import { isImageCategory } from "../uploads/file-validation";
import { validateOwnership } from "../uploads/ownership";
import { validateImageUpload } from "../images/image-validation";
import { validateDocumentUpload } from "../documents/document-validation";

export interface SignedUrlResult {
  url: string;
  expiresAt: number;
}

/**
 * The single facade every business module uploads/deletes/replaces
 * through (docs/18's "every module uses Storage abstraction"). Never
 * exposes the raw `StorageProvider` — category-based validation, key
 * generation, visibility, and ownership checks all happen here so no
 * call site can bypass them.
 */
export class StorageService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly provider: StorageProvider,
    private readonly signedUrls: SignedUrlService
  ) {
    super(context);
  }

  async upload(body: Buffer, options: UploadOptions): Promise<Result<StorageObject, AppError>> {
    const validated = isImageCategory(options.category)
      ? validateImageUpload(options.category, options.contentType, body.length)
      : validateDocumentUpload(options.category, options.contentType, body.length);
    if (isErr(validated)) return validated;

    const key = generateStorageKey(options.category, options.ownerId, options.fileName);
    const visibility = CATEGORY_VISIBILITY[options.category];
    const uploaded = await this.provider.upload({ key, body, contentType: options.contentType, visibility });
    if (isErr(uploaded)) return uploaded;

    this.logger.info("Storage object uploaded", { key, category: options.category });
    return ok(this.toStorageObject(uploaded.value, options.category, visibility));
  }

  /** Ownership of `existingKey` is checked against `options.ownerId` before the new upload runs; the old object is only deleted after the new one succeeds. */
  async replace(body: Buffer, options: ReplaceOptions): Promise<Result<StorageObject, AppError>> {
    const ownership = validateOwnership(options.category, options.existingKey, options.ownerId);
    if (isErr(ownership)) return ownership;

    const uploaded = await this.upload(body, options);
    if (isErr(uploaded)) return uploaded;

    const deleted = await this.provider.delete(options.existingKey);
    if (isErr(deleted)) {
      this.logger.error("Failed to delete replaced storage object", { key: options.existingKey, error: deleted.error.message });
    }
    return uploaded;
  }

  async delete(category: StorageCategory, key: string, callerId: string): Promise<Result<void, AppError>> {
    const ownership = validateOwnership(category, key, callerId);
    if (isErr(ownership)) return ownership;
    return this.provider.delete(key);
  }

  async getMetadata(category: StorageCategory, key: string, callerId: string): Promise<Result<StorageObject | null, AppError>> {
    const ownership = validateOwnership(category, key, callerId);
    if (isErr(ownership)) return ownership;

    const metadata = await this.provider.getMetadata(key);
    if (isErr(metadata)) return metadata;
    if (!metadata.value) return ok(null);

    return ok(this.toStorageObject(metadata.value, category, CATEGORY_VISIBILITY[category]));
  }

  /** Public-category objects can be read directly via their stored `url` — this only matters for PRIVATE (document) categories. */
  async getSignedUrl(
    category: StorageCategory,
    key: string,
    callerId: string,
    ttlSeconds?: number
  ): Promise<Result<SignedUrlResult, AppError>> {
    const ownership = validateOwnership(category, key, callerId);
    if (isErr(ownership)) return ownership;

    const signed = this.signedUrls.sign(key, ttlSeconds);
    const url = `/api/storage/download?key=${encodeURIComponent(signed.key)}&expiresAt=${signed.expiresAt}&signature=${encodeURIComponent(signed.signature)}`;
    return ok({ url, expiresAt: signed.expiresAt });
  }

  /** Used only by the download-proxy route — verifies the HMAC signature, then streams the private bytes back. */
  async downloadPrivateObject(key: string, expiresAt: number, signature: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
    const verified = this.signedUrls.verify(key, expiresAt, signature);
    if (isErr(verified)) return verified;
    return this.provider.getPrivateObjectBytes(key);
  }

  private toStorageObject(metadata: ProviderObjectMetadata, category: StorageCategory, visibility: StorageVisibility): StorageObject {
    return {
      key: metadata.key,
      url: metadata.url,
      category,
      visibility,
      contentType: metadata.contentType,
      size: metadata.size,
      uploadedAt: metadata.uploadedAt,
    };
  }
}
