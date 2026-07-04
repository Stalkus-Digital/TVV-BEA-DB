import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { StorageVisibility } from "../types/storage-category";

export interface ProviderUploadInput {
  key: string;
  body: Buffer;
  contentType: string;
  visibility: StorageVisibility;
}

export interface ProviderObjectMetadata {
  url: string;
  key: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * The abstraction docs/18 called for — implement once, swap behind this
 * interface, the same "define the interface, swap the implementation"
 * principle every other cross-cutting capability in this project follows
 * (Logger, Config, Website's cache port). `VercelBlobProvider` is the only
 * concrete implementation this sprint; S3/Cloudflare R2 are future
 * implementations of this exact same interface, not designed here.
 */
export interface StorageProvider {
  upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>>;
  delete(key: string): Promise<Result<void, AppError>>;
  getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>>;
  /** Fetches the raw bytes of a private object — used only by the signed-URL download proxy, never exposed directly. */
  getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>>;
}
