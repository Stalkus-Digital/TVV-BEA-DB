import { jsonSuccess } from "@/api";
import { getIntegrationConfigResolver } from "@/modules/integrations";

/**
 * GET /api/website/public-config
 * Non-secret runtime config for the marketing site (reCAPTCHA site key, etc.).
 */
export async function GET() {
  const recaptcha = await getIntegrationConfigResolver().getRecaptchaConfig();
  return jsonSuccess({
    recaptcha: {
      enabled: Boolean(recaptcha.enabled && recaptcha.siteKey),
      siteKey: recaptcha.enabled ? recaptcha.siteKey ?? null : null,
    },
  });
}
