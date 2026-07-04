import { createHmac, timingSafeEqual } from "node:crypto";
import { err, ok, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import { StorageConfigService } from "../services/storage-config.service";

export interface SignedDownload {
  key: string;
  expiresAt: number;
  signature: string;
}

function computeSignature(key: string, expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`${key}:${expiresAt}`).digest("base64url");
}

/**
 * Self-issued HMAC signed URLs for private storage objects — rather than
 * Vercel Blob's newer presign-token flow (`issueSignedToken` +
 * `presignUrl`, a multi-step API that doesn't match this module's simple
 * "expiring download link" need), this mirrors `JwtService`'s exact
 * hand-rolled HMAC pattern: one shared secret, `timingSafeEqual`
 * comparison, no new dependency.
 */
export class SignedUrlService {
  constructor(
    private readonly secret: string,
    private readonly defaultTtlSeconds: number
  ) {}

  static fromConfig(): SignedUrlService {
    const config = StorageConfigService.getInstance();
    return new SignedUrlService(config.get("signingSecret"), config.get("defaultSignedUrlTtlSeconds"));
  }

  sign(key: string, ttlSeconds?: number): SignedDownload {
    const expiresAt = Math.floor(Date.now() / 1000) + (ttlSeconds ?? this.defaultTtlSeconds);
    const signature = computeSignature(key, expiresAt, this.secret);
    return { key, expiresAt, signature };
  }

  verify(key: string, expiresAt: number, signature: string): Result<void, AppError> {
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      return err(new UnauthorizedError("Signed URL has expired"));
    }

    const expected = Buffer.from(computeSignature(key, expiresAt, this.secret));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return err(new UnauthorizedError("Invalid signed URL signature"));
    }
    return ok(undefined);
  }
}
