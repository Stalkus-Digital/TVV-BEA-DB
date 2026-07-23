import { S3Client, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { err, ok, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import type { ProviderObjectMetadata, ProviderUploadInput, StorageProvider } from "./storage-provider";

export class S3Provider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;

  constructor() {
    this.bucket = process.env.DO_SPACES_BUCKET || "";
    this.cdnUrl = process.env.DO_SPACES_CDN || "";
    
    this.client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY || "",
        secretAccessKey: process.env.DO_SPACES_SECRET || "",
      },
      // Force path style is sometimes required for DO spaces depending on configuration, 
      // but usually not if the endpoint is right.
      forcePathStyle: false,
    });
  }

  async upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>> {
    try {
      const acl = input.visibility === "PUBLIC" ? "public-read" : "private";
      
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          ACL: acl,
        },
      });

      await upload.done();

      // Construct the public URL via the CDN
      const publicUrl = `${this.cdnUrl.replace(/\/$/, "")}/${input.key}`;

      return ok({
        url: publicUrl,
        key: input.key,
        size: input.body.length,
        contentType: input.contentType,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      return err(new InternalError(`S3/Spaces upload failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(key: string): Promise<Result<void, AppError>> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(new InternalError(`S3/Spaces delete failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      
      const publicUrl = `${this.cdnUrl.replace(/\/$/, "")}/${key}`;
      
      return ok({
        url: publicUrl,
        key: key,
        size: response.ContentLength || 0,
        contentType: response.ContentType || "application/octet-stream",
        uploadedAt: response.LastModified ? response.LastModified.toISOString() : new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.name === "NotFound") return ok(null);
      return err(new InternalError(`S3/Spaces metadata lookup failed: ${error?.message || error}`));
    }
  }

  async getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      
      if (!response.Body) {
         return err(new InternalError("Empty response body from S3"));
      }
      
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);
      
      return ok({
        body: buffer,
        contentType: response.ContentType || "application/octet-stream",
      });
    } catch (error: any) {
       return err(new InternalError(`S3/Spaces getPrivateObjectBytes failed: ${error?.message || error}`));
    }
  }
}
