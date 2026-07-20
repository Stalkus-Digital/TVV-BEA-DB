import { v2 as cloudinary } from "cloudinary";
import { err, ok, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import type { ProviderObjectMetadata, ProviderUploadInput, StorageProvider } from "./storage-provider";

// We rely on standard environment variables:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * SECURITY-002C: `resource_type` is derived from the already
 * magic-byte-validated `contentType` (file-validation.ts), not left as
 * `"auto"`. `"auto"` lets Cloudinary accept and store whatever bytes
 * arrive regardless of what was validated upstream — pinning it to
 * `"image"` for image content types makes Cloudinary itself reject
 * non-image bytes as a second, independent check, rather than relying
 * solely on this app's own validation.
 */
function resourceTypeForContentType(contentType: string): "image" | "raw" {
  return contentType.trim().toLowerCase().startsWith("image/") ? "image" : "raw";
}

export class CloudinaryProvider implements StorageProvider {
  async upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>> {
    try {
      return new Promise((resolve) => {
        // Remove file extension as Cloudinary manages formats automatically
        // and appends its own extensions if not careful
        const publicId = input.key.replace(/\.[^/.]+$/, "");

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: resourceTypeForContentType(input.contentType),
            type: input.visibility === "PUBLIC" ? "upload" : "private",
          },
          (error, result) => {
            if (error || !result) {
              resolve(err(new InternalError(`Cloudinary upload failed: ${error?.message || "Unknown error"}`)));
            } else {
              resolve(ok({
                url: result.secure_url,
                key: result.public_id,
                size: result.bytes,
                contentType: input.contentType,
                uploadedAt: new Date().toISOString(),
              }));
            }
          }
        );
        uploadStream.end(input.body);
      });
    } catch (error) {
      return err(new InternalError(`Storage upload failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(key: string): Promise<Result<void, AppError>> {
    try {
      const result = await cloudinary.uploader.destroy(key);
      if (result.result !== "ok" && result.result !== "not found") {
        return err(new InternalError(`Cloudinary delete failed: ${result.result}`));
      }
      return ok(undefined);
    } catch (error) {
      return err(new InternalError(`Storage delete failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>> {
    try {
      const result = await cloudinary.api.resource(key);
      return ok({
        url: result.secure_url,
        key: result.public_id,
        size: result.bytes,
        contentType: `image/${result.format}`,
        uploadedAt: result.created_at,
      });
    } catch (error: any) {
      if (error?.http_code === 404) return ok(null);
      return err(new InternalError(`Storage metadata lookup failed: ${error?.message || error}`));
    }
  }

  async getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
    // Advanced: To get private bytes from Cloudinary, you typically generate a signed URL
    // and then fetch it. For now, returning an error since TVV only uses public images for 
    // packages/hotels/activities in this context.
    return err(new InternalError("getPrivateObjectBytes not fully implemented for CloudinaryProvider"));
  }
}
