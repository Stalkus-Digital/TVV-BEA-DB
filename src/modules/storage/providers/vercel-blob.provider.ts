import { del, get, head, put, BlobNotFoundError } from "@vercel/blob";
import { err, isErr, ok, type Result } from "@/shared/types";
import { InternalError, NotFoundError, type AppError } from "@/shared/errors";
import { StorageConfigService } from "../services/storage-config.service";
import type { ProviderObjectMetadata, ProviderUploadInput, StorageProvider } from "./storage-provider";

function requireToken(): Result<string, AppError> {
  const value = StorageConfigService.getInstance().get("blobReadWriteToken");
  if (!value) {
    return err(new InternalError("BLOB_READ_WRITE_TOKEN is not configured — see docs/33_STORAGE_PLATFORM.md's Remaining TODOs"));
  }
  return ok(value);
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * The default, concrete implementation of `StorageProvider` (docs/18's
 * recommendation) — every method fails closed with a clear `InternalError`
 * if `BLOB_READ_WRITE_TOKEN` isn't configured, rather than throwing an
 * unhandled exception or silently no-op'ing.
 */
export class VercelBlobProvider implements StorageProvider {
  async upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>> {
    const token = requireToken();
    if (isErr(token)) return token;

    try {
      const result = await put(input.key, input.body, {
        access: input.visibility === "PUBLIC" ? "public" : "private",
        contentType: input.contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
        token: token.value,
      });
      return ok({
        url: result.url,
        key: result.pathname,
        // PutBlobResult has no `size` field — the input buffer's own length is authoritative, no round-trip needed.
        size: input.body.length,
        contentType: result.contentType,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      return err(new InternalError(`Storage upload failed: ${toMessage(error)}`));
    }
  }

  async delete(key: string): Promise<Result<void, AppError>> {
    const token = requireToken();
    if (isErr(token)) return token;

    try {
      await del(key, { token: token.value });
      return ok(undefined);
    } catch (error) {
      return err(new InternalError(`Storage delete failed: ${toMessage(error)}`));
    }
  }

  async getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>> {
    const token = requireToken();
    if (isErr(token)) return token;

    try {
      const result = await head(key, { token: token.value });
      return ok({
        url: result.url,
        key: result.pathname,
        size: result.size,
        contentType: result.contentType,
        uploadedAt: result.uploadedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof BlobNotFoundError) return ok(null);
      return err(new InternalError(`Storage metadata lookup failed: ${toMessage(error)}`));
    }
  }

  async getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
    const token = requireToken();
    if (isErr(token)) return token;

    try {
      const result = await get(key, { access: "private", token: token.value });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return err(new NotFoundError(`Storage object "${key}" not found`));
      }
      const chunks: Uint8Array[] = [];
      const reader = result.stream.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      return ok({ body: Buffer.concat(chunks), contentType: result.blob.contentType ?? "application/octet-stream" });
    } catch (error) {
      if (error instanceof BlobNotFoundError) return err(new NotFoundError(`Storage object "${key}" not found`));
      return err(new InternalError(`Storage download failed: ${toMessage(error)}`));
    }
  }
}
