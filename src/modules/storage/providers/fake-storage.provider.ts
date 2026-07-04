import { err, ok, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { ProviderObjectMetadata, ProviderUploadInput, StorageProvider } from "./storage-provider";

interface FakeRecord {
  body: Buffer;
  contentType: string;
  size: number;
  uploadedAt: string;
}

/**
 * In-memory `StorageProvider` test double — lets `StorageService` and its
 * unit tests exercise upload/delete/replace/metadata/download orchestration
 * without a real `BLOB_READ_WRITE_TOKEN`. Never used outside tests.
 */
export class FakeStorageProvider implements StorageProvider {
  private readonly objects = new Map<string, FakeRecord>();

  async upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>> {
    const record: FakeRecord = {
      body: input.body,
      contentType: input.contentType,
      size: input.body.length,
      uploadedAt: new Date().toISOString(),
    };
    this.objects.set(input.key, record);
    return ok(this.toMetadata(input.key, record));
  }

  async delete(key: string): Promise<Result<void, AppError>> {
    this.objects.delete(key);
    return ok(undefined);
  }

  async getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>> {
    const record = this.objects.get(key);
    if (!record) return ok(null);
    return ok(this.toMetadata(key, record));
  }

  async getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
    const record = this.objects.get(key);
    if (!record) return err(new NotFoundError(`Storage object "${key}" not found`));
    return ok({ body: record.body, contentType: record.contentType });
  }

  /** Test-only inspection helpers — not part of the `StorageProvider` interface. */
  has(key: string): boolean {
    return this.objects.has(key);
  }

  get size(): number {
    return this.objects.size;
  }

  private toMetadata(key: string, record: FakeRecord): ProviderObjectMetadata {
    return {
      url: `https://fake-blob.test/${key}`,
      key,
      size: record.size,
      contentType: record.contentType,
      uploadedAt: record.uploadedAt,
    };
  }
}
