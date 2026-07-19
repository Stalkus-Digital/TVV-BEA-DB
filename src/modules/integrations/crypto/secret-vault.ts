import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { VaultSecurityConfigService } from "../services/vault-security.service";

const ALGO = "aes-256-gcm";
const KEY_LENGTH_BYTES = 32; // AES-256 requires exactly a 32-byte key.

/**
 * SEC-001: derives the actual AES-256 key from INTEGRATION_SECRETS_KEY
 * (validated/fail-fast by VaultSecurityConfigService — see that file for
 * the production-mandatory, dev-fallback-allowed policy). No longer falls
 * back to AUTH_JWT_SECRET: reusing a key across two unrelated security
 * domains (auth tokens vs. stored integration credentials) means rotating
 * one has a silent side effect on the other, which is a risk independent
 * of whether either value is individually strong.
 */
function resolveKey(): Buffer {
  const raw = VaultSecurityConfigService.getInstance().getRawKey();
  const key = createHash("sha256").update(raw).digest();
  if (key.length !== KEY_LENGTH_BYTES) {
    // SHA-256 always produces 32 bytes, so this should be unreachable —
    // asserted explicitly anyway so a future refactor that changes the
    // hash algorithm fails loudly here instead of silently weakening
    // every secret encrypted afterward.
    throw new Error(`Derived encryption key is ${key.length} bytes, expected ${KEY_LENGTH_BYTES} for AES-256-GCM`);
  }
  return key;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * `keyOverride` is only used by the key-rotation utility (see
 * services/key-rotation.service.ts) to decrypt with a retiring key or
 * encrypt with an incoming one without touching the live
 * INTEGRATION_SECRETS_KEY env var mid-rotation. Every normal call site
 * omits it and gets the current configured key.
 */
export function encryptSecret(plaintext: string, keyOverride?: Buffer): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, keyOverride ?? resolveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedPayload, keyOverride?: Buffer): string {
  const decipher = createDecipheriv(ALGO, keyOverride ?? resolveKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Derives a raw key buffer from an arbitrary string — used by the rotation utility to build the "old key" and "new key" buffers it passes as keyOverride above. */
export function deriveKeyFromString(raw: string): Buffer {
  return createHash("sha256").update(raw).digest();
}

export function lastFour(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) return trimmed;
  return trimmed.slice(-4);
}
