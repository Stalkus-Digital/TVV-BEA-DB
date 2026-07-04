import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * scrypt, not a hand-rolled hash — Node's own crypto docs recommend it
 * specifically for password storage (memory-hard, resistant to GPU/ASIC
 * cracking, unlike a bare SHA-256). No `bcrypt` dependency needed: this is
 * a built-in, cryptographically sound choice, not a shortcut. Async
 * (promisify'd, not scryptSync) so hashing a password on every login
 * request doesn't block the Node event loop under concurrent load.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
