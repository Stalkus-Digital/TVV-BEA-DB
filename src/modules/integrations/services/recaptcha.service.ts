import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { getIntegrationConfigResolver } from "@/modules/integrations";

/**
 * When reCAPTCHA is enabled in Integrations, require a valid token.
 * When disabled / not configured, allow through (no-op).
 */
export async function verifyRecaptchaToken(token: unknown): Promise<Result<void, AppError>> {
  const cfg = await getIntegrationConfigResolver().getRecaptchaConfig();
  if (!cfg.enabled || !cfg.secretKey) {
    return ok(undefined);
  }

  if (typeof token !== "string" || !token.trim()) {
    return err(new ValidationError("reCAPTCHA verification is required"));
  }

  const params = new URLSearchParams();
  params.set("secret", cfg.secretKey);
  params.set("response", token.trim());

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
  if (!data.success) {
    return err(new ValidationError("reCAPTCHA verification failed"));
  }

  return ok(undefined);
}
