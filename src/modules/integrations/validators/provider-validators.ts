/**
 * Integration Provider Validators
 *
 * Real connectivity validation for each provider.
 * Each validator performs actual API calls, not just credential checks.
 */

import * as nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import type { ProviderValidator } from "../types/integration-status";

/**
 * OpenAI API Validator
 * Performs lightweight API request to verify credentials.
 */
export const openaiValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const apiKey = secrets.apiKey?.trim();
    if (!apiKey) return { ok: false, message: "OpenAI API key not configured" };

    if (!apiKey.startsWith("sk-")) {
      return {
        ok: false,
        message:
          "Invalid key format. OpenAI keys start with sk- (not Google AI Studio / Gemini keys)",
      };
    }

    try {
      const res = await fetch("https://api.openai.com/v1/models?limit=1", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.status === 401) {
        return { ok: false, message: "OpenAI rejected this API key (401 Unauthorized)" };
      }

      if (!res.ok) {
        return { ok: false, message: `OpenAI API error: ${res.status} ${res.statusText}` };
      }

      return { ok: true, message: "OpenAI API connection successful" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `OpenAI connection error: ${msg}` };
    }
  },
};

/**
 * Razorpay Validator
 * Authenticates against Razorpay API to verify credentials.
 */
export const razorpayValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const keyId = secrets.keyId?.trim();
    const keySecret = secrets.keySecret?.trim();

    if (!keyId || !keySecret) {
      return { ok: false, message: "Razorpay key ID and secret not configured" };
    }

    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/payments?count=1&skip=0", {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: `Razorpay authentication failed (${res.status}). Check key ID and secret.`,
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          message: `Razorpay API error: ${res.status} ${res.statusText}`,
        };
      }

      return { ok: true, message: "Razorpay credentials verified" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `Razorpay connection error: ${msg}` };
    }
  },
};

/**
 * PhonePe Validator
 * Validates PhonePe merchant credentials via API.
 *
 * The previous implementation called `https://api.phonepe.com/apis/hermes/merchant/me`
 * — verified live that this path does not exist on PhonePe's real gateway: it
 * returns HTTP 400 unconditionally, with no headers at all, with well-formed
 * fake credentials, and with garbage credentials, all identically. That means
 * the previous validator could NEVER report CONNECTED, even given genuinely
 * valid credentials — a false-negative bug, the mirror image of the
 * false-positive class this sprint exists to eliminate.
 *
 * This implementation instead reuses the exact auth scheme this codebase's
 * own working payment adapter uses (`src/modules/payments/adapters/phonepe/
 * phonepe.adapter.ts`'s `buildXVerify`: `sha256(payload + path + saltKey) +
 * "###" + saltIndex`), pointed at PhonePe's real, read-only Status Check API
 * (`GET /pg/v1/status/{merchantId}/{merchantTransactionId}`) with a
 * transaction ID that doesn't exist — never creating a real payment or any
 * other side effect. NOTE: no real PhonePe merchant credentials were
 * available to empirically verify this endpoint's exact success/failure
 * response shape the way TripJack's fix was verified live against a real
 * account — this fix is a documented correction of a confirmed-broken
 * endpoint, not independently proven against a live merchant. Treat the
 * CONNECTED path here as unverified until tested against a real sandbox
 * account.
 */
export const phonePeValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const merchantId = secrets.merchantId?.trim();
    const saltKey = secrets.saltKey?.trim();
    const saltIndex = secrets.saltIndex?.trim() || "1";
    const baseUrl = (secrets.baseUrl?.trim() || "https://api.phonepe.com/apis/hermes").replace(/\/$/, "");

    if (!merchantId || !saltKey) {
      return {
        ok: false,
        message: "PhonePe merchantId and saltKey not configured",
      };
    }

    try {
      const probeTxnId = `TVVHEALTHCHECK${Date.now()}`;
      const path = `/pg/v1/status/${merchantId}/${probeTxnId}`;
      const xVerify = `${createHash("sha256").update(path + saltKey).digest("hex")}###${saltIndex}`;

      const res = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      });

      const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;

      if (res.status === 401 || res.status === 403 || body?.code === "INVALID_CHECKSUM" || body?.code === "KEY_NOT_CONFIGURED") {
        return {
          ok: false,
          message: `PhonePe rejected these credentials${body?.message ? `: ${body.message}` : ""} (checksum/merchant ID invalid)`,
        };
      }

      // A "transaction not found"-style response (or any non-auth error)
      // means the checksum was accepted and the request reached PhonePe's
      // backend — proving the merchantId/saltKey pair is valid.
      return { ok: true, message: "PhonePe credentials accepted" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `PhonePe connection error: ${msg}` };
    }
  },
};

/**
 * SMTP Validator
 * Attempts to connect and authenticate with SMTP server.
 */
export const smtpValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const host = secrets.host?.trim();
    const port = parseInt(secrets.port || "587", 10);
    const user = secrets.user?.trim();
    const pass = secrets.pass?.trim();
    const secure = secrets.secure === "true" || secrets.secure === "1" || port === 465;

    if (!host || !user || !pass) {
      return { ok: false, message: "SMTP host, user, and password not configured" };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      await transporter.verify();
      return { ok: true, message: "SMTP connection successful" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      if (msg.includes("Invalid login") || msg.includes("Authentication failed")) {
        return {
          ok: false,
          message: "SMTP authentication failed. Check username and password.",
        };
      }
      return { ok: false, message: `SMTP error: ${msg}` };
    }
  },
};

/**
 * TripJack Validator
 * Authenticates with TripJack supplier API.
 *
 * Auth model verified live against apitest.tripjack.com (UAT): TripJack sends
 * the API key via an `apikey` header, NOT `Authorization: Bearer` — using
 * Bearer (the previous implementation) never matches their auth model at all.
 *
 * More importantly, TripJack's gateway does not use HTTP status codes for
 * auth failures. Verified live with a real key, a garbage key, and a missing
 * key: an invalid/missing `apikey` is rejected by the gateway with a
 * structured business-error body (`status.success: false`, `errors[]`) at
 * HTTP 200 — it never reaches the backend. A VALID key is instead proxied
 * through to the real backend service, which returns its own genuine 404
 * (Spring Boot's default `{status, error, path}` shape) for any path that
 * isn't a real registered route. So checking `res.status` (the previous
 * implementation) is worse than useless here: a 200 response is exactly what
 * an INVALID key produces. The reliable signal is which of these two response
 * shapes comes back, which is why any lightweight path works for this check —
 * it never needs to be a real business route, only reachable past the gateway.
 */
export const tripjackValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const apiUrl = secrets.apiUrl?.trim().replace(/\/$/, "");
    const token = secrets.token?.trim();
    const agencyId = secrets.agencyId?.trim();
    const userId = secrets.userId?.trim();
    const password = secrets.password?.trim();

    if (!apiUrl) {
      return { ok: false, message: "TripJack API URL not configured" };
    }

    const hasToken = !!token;
    const hasAgencyAuth = !!agencyId && !!userId && !!password;

    if (!hasToken && !hasAgencyAuth) {
      return {
        ok: false,
        message: "TripJack token or agency credentials not configured",
      };
    }

    let apiKey = token;

    if (!hasToken && hasAgencyAuth) {
      try {
        const loginRes = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agencyId, userId, password }),
        });

        const loginBody = (await loginRes.json().catch(() => null)) as { token?: string } | null;
        if (!loginRes.ok || !loginBody?.token) {
          return {
            ok: false,
            message: `TripJack login failed (${loginRes.status}). Check agency ID, user ID, and password.`,
          };
        }
        apiKey = loginBody.token;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        return { ok: false, message: `TripJack login error: ${msg}` };
      }
    }

    try {
      const res = await fetch(`${apiUrl}/hms/v3/hotel/listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey! },
        body: JSON.stringify({}),
      });

      const body = (await res.json().catch(() => null)) as {
        status?: { success?: boolean };
        errors?: Array<{ message?: string }>;
      } | null;

      const gatewayRejectedKey = body?.status?.success === false;

      if (gatewayRejectedKey) {
        const detail = body?.errors?.[0]?.message;
        return {
          ok: false,
          message: detail
            ? `TripJack rejected this API key: ${detail}`
            : "TripJack rejected this API key.",
        };
      }

      // Any other response (including a plain 404 from the backend itself)
      // means the gateway accepted the key and proxied the request through.
      return { ok: true, message: "TripJack API key accepted" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `TripJack connection error: ${msg}` };
    }
  },
};

/**
 * Cloudinary Validator
 * Verifies Cloudinary credentials via API.
 */
export const cloudinaryValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const cloudName = secrets.cloudName?.trim();
    const apiKey = secrets.apiKey?.trim();
    const apiSecret = secrets.apiSecret?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        ok: false,
        message: "Cloudinary cloudName, apiKey, and apiSecret not configured",
      };
    }

    try {
      // Cloudinary uses Basic auth for API
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`, {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: "Cloudinary authentication failed. Check credentials.",
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          message: `Cloudinary API error: ${res.status}`,
        };
      }

      return { ok: true, message: "Cloudinary credentials verified" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `Cloudinary connection error: ${msg}` };
    }
  },
};

/**
 * reCAPTCHA Validator
 * Verifies reCAPTCHA site/secret pair.
 */
export const recaptchaValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const siteKey = secrets.siteKey?.trim();
    const secretKey = secrets.secretKey?.trim();

    if (!siteKey || !secretKey) {
      return {
        ok: false,
        message: "reCAPTCHA siteKey and secretKey not configured",
      };
    }

    /**
     * Google's siteverify endpoint cannot confirm a secret key's authenticity
     * without a real browser-solved challenge token. Verified empirically: a
     * garbage secret and Google's own published test secret both produce
     * `error-codes: ["invalid-input-response"]` when called with a synthetic
     * `response` value — Google checks the response token first and never
     * reaches secret validation in that path, so `invalid-input-secret` never
     * actually appears here regardless of whether the secret is right, wrong,
     * or nonsense. Relying on that error code alone (the previous behavior)
     * meant ANY secret string reported CONNECTED — a false positive on every
     * invalid credential. Format validation is the strongest signal obtainable
     * server-side, so garbage/typo'd secrets are rejected before the API call.
     */
    if (!/^6[A-Za-z][A-Za-z0-9_-]{38}$/.test(secretKey)) {
      return {
        ok: false,
        message:
          "reCAPTCHA secret key has an invalid format (expected a 40-character Google key starting with 6L/6M/...)",
      };
    }

    try {
      const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secretKey)}&response=test`,
      });

      if (!res.ok) {
        return {
          ok: false,
          message: `reCAPTCHA API error: ${res.status}`,
        };
      }

      const data = (await res.json()) as { success?: boolean; error_codes?: string[] };

      if (
        data.error_codes?.includes("invalid-input-secret") ||
        data.error_codes?.includes("missing-input-secret")
      ) {
        return {
          ok: false,
          message: "reCAPTCHA secret key is invalid",
        };
      }

      return {
        ok: true,
        message:
          "reCAPTCHA secret key is well-formed and Google's API is reachable (full authentication requires a live challenge token — Google's API cannot verify a secret in isolation)",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `reCAPTCHA connection error: ${msg}` };
    }
  },
};

/**
 * Sembark Validator
 * Validates Sembark API credentials.
 */
export const sembarkValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const apiUrl = secrets.apiUrl?.trim();
    const apiKey = secrets.apiKey?.trim();

    if (!apiUrl || !apiKey) {
      return {
        ok: false,
        message: "Sembark apiUrl and apiKey not configured",
      };
    }

    try {
      const res = await fetch(`${apiUrl}/health`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: "Sembark authentication failed. Check API key.",
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          message: `Sembark API error: ${res.status}`,
        };
      }

      return { ok: true, message: "Sembark connection verified" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `Sembark connection error: ${msg}` };
    }
  },
};

/**
 * Ferry Operator Generic Validator
 * Validates ferry operator API credentials.
 */
export const ferryOperatorValidator: ProviderValidator = {
  async testConnection(secrets: Record<string, string>) {
    const apiBaseUrl = secrets.apiBaseUrl?.trim();
    const apiKey = secrets.apiKey?.trim();

    if (!apiBaseUrl || !apiKey) {
      return {
        ok: false,
        message: "Ferry API URL and API key not configured",
      };
    }

    try {
      const res = await fetch(`${apiBaseUrl}/health`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          message: "Ferry API authentication failed. Check credentials.",
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          message: `Ferry API error: ${res.status}`,
        };
      }

      return { ok: true, message: "Ferry operator connection verified" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      return { ok: false, message: `Ferry API connection error: ${msg}` };
    }
  },
};

/**
 * Registry of all provider validators
 * Maps provider key to validator implementation
 */
export const PROVIDER_VALIDATORS: Record<string, ProviderValidator> = {
  openai: openaiValidator,
  razorpay: razorpayValidator,
  phonepe: phonePeValidator,
  smtp: smtpValidator,
  tripjack: tripjackValidator,
  cloudinary: cloudinaryValidator,
  recaptcha: recaptchaValidator,
  sembark: sembarkValidator,
};

/**
 * Get validator for a provider key
 * Returns null if no specific validator (uses generic ferry operator validator)
 */
export function getProviderValidator(
  key: string
): ProviderValidator | null {
  if (key in PROVIDER_VALIDATORS) {
    return PROVIDER_VALIDATORS[key];
  }
  if (key.startsWith("ferry:")) {
    return ferryOperatorValidator;
  }
  return null;
}
