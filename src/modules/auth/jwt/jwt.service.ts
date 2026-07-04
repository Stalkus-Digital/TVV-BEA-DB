import { createHmac, timingSafeEqual } from "node:crypto";
import { err, ok, type Result } from "@/shared/types";
import { UnauthorizedError } from "@/shared/errors";
import type { JwtPayload } from "./jwt.types";

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function computeSignature(headerAndBody: string, secret: string): string {
  return createHmac("sha256", secret).update(headerAndBody).digest("base64url");
}

/**
 * Hand-rolled HS256 JWT — no `jsonwebtoken` dependency, same zero-dependency
 * discipline as this project's Logger/DI/Config. HS256 (HMAC, not RSA) is
 * the right choice here: this service both issues and verifies its own
 * tokens (no third party ever needs to verify one with a public key), so a
 * shared symmetric secret is simpler and equally correct. Signature
 * comparison uses timingSafeEqual, not `===`, specifically to avoid a
 * timing side-channel — this is exactly the class of security-sensitive
 * code docs/17 flagged as worth extra care, even though the sprint brief
 * asks for a hand-rolled implementation rather than a library this time.
 */
export class JwtService {
  constructor(private readonly secret: string) {}

  issue(claims: Omit<JwtPayload, "iat" | "exp">, ttlSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = { ...claims, iat: now, exp: now + ttlSeconds };
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signature = computeSignature(`${header}.${body}`, this.secret);
    return `${header}.${body}.${signature}`;
  }

  verify(token: string): Result<JwtPayload, UnauthorizedError> {
    const parts = token.split(".");
    if (parts.length !== 3) return err(new UnauthorizedError("Malformed token"));
    const [header, body, signature] = parts;

    const expected = Buffer.from(computeSignature(`${header}.${body}`, this.secret));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return err(new UnauthorizedError("Invalid token signature"));
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;
    } catch {
      return err(new UnauthorizedError("Malformed token payload"));
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return err(new UnauthorizedError("Token expired"));
    }

    return ok(payload);
  }
}
