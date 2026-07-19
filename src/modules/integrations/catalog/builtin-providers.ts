import {
  IntegrationCategory,
  SYSTEM_PAYMENTS_KEY,
  type BuiltinProviderDefinition,
} from "../types/integration";

export const BUILTIN_PROVIDERS: BuiltinProviderDefinition[] = [
  {
    key: "openai",
    category: IntegrationCategory.AI,
    name: "OpenAI",
    description: "Powers the AI holiday package builder and AI Studio.",
    fields: [
      { key: "apiKey", label: "API Key", kind: "secret", secret: true, required: true, envFallback: "OPENAI_API_KEY", placeholder: "sk-..." },
    ],
  },
  {
    key: "razorpay",
    category: IntegrationCategory.PAYMENTS,
    name: "Razorpay",
    description: "Primary payment gateway (orders, checkout, webhooks).",
    fields: [
      { key: "keyId", label: "Key ID", kind: "text", secret: false, required: true, envFallback: "RAZORPAY_KEY_ID", placeholder: "rzp_live_..." },
      { key: "keySecret", label: "Key Secret", kind: "secret", secret: true, required: true, envFallback: "RAZORPAY_KEY_SECRET" },
      { key: "webhookSecret", label: "Webhook Secret", kind: "secret", secret: true, required: false, envFallback: "RAZORPAY_WEBHOOK_SECRET" },
    ],
    webhooks: [{ eventType: "payment", path: "/api/webhooks/razorpay" }],
  },
  {
    key: "phonepe",
    category: IntegrationCategory.PAYMENTS,
    name: "PhonePe",
    description: "Alternate payment gateway. Activate via Payments toggle.",
    fields: [
      { key: "merchantId", label: "Merchant ID", kind: "text", secret: false, required: true, envFallback: "PHONEPE_MERCHANT_ID" },
      { key: "saltKey", label: "Salt Key", kind: "secret", secret: true, required: true, envFallback: "PHONEPE_SALT_KEY" },
      { key: "saltIndex", label: "Salt Index", kind: "text", secret: false, required: true, envFallback: "PHONEPE_SALT_INDEX", placeholder: "1" },
      { key: "clientId", label: "Client ID (optional)", kind: "text", secret: false, required: false, envFallback: "PHONEPE_CLIENT_ID" },
      { key: "clientSecret", label: "Client Secret (optional)", kind: "secret", secret: true, required: false, envFallback: "PHONEPE_CLIENT_SECRET" },
      { key: "baseUrl", label: "API Base URL", kind: "url", secret: false, required: false, envFallback: "PHONEPE_BASE_URL", placeholder: "https://api.phonepe.com/apis/hermes" },
    ],
    webhooks: [{ eventType: "payment", path: "/api/webhooks/phonepe" }],
  },
  {
    key: SYSTEM_PAYMENTS_KEY,
    category: IntegrationCategory.PAYMENTS,
    name: "Active payment gateway",
    description: "Choose which gateway the website checkout uses (Razorpay or PhonePe).",
    fields: [],
  },
  {
    key: "tripjack",
    category: IntegrationCategory.SUPPLIERS,
    name: "TripJack",
    description: "Flights, hotels, and supplier inventory via TripJack.",
    fields: [
      { key: "apiUrl", label: "API URL", kind: "url", secret: false, required: true, envFallback: "TRIPJACK_API_URL" },
      { key: "token", label: "API Token", kind: "secret", secret: true, required: false, envFallback: "TRIPJACK_TOKEN" },
      { key: "agencyId", label: "Agency ID", kind: "text", secret: false, required: false, envFallback: "TRIPJACK_AGENCY_ID" },
      { key: "userId", label: "User ID", kind: "text", secret: false, required: false, envFallback: "TRIPJACK_USER_ID" },
      { key: "password", label: "Password", kind: "secret", secret: true, required: false, envFallback: "TRIPJACK_PASSWORD" },
      { key: "enabled", label: "Enabled", kind: "boolean", secret: false, required: false, envFallback: "TRIPJACK_ENABLED" },
    ],
  },
  {
    key: "smtp",
    category: IntegrationCategory.EMAIL,
    name: "Email (SMTP / Gmail)",
    description: "Transactional email for verification, password reset, and booking confirmations.",
    fields: [
      { key: "host", label: "SMTP Host", kind: "text", secret: false, required: true, envFallback: "SMTP_HOST", placeholder: "smtp.gmail.com" },
      { key: "port", label: "Port", kind: "text", secret: false, required: false, envFallback: "SMTP_PORT", placeholder: "587" },
      { key: "secure", label: "Secure (SSL)", kind: "boolean", secret: false, required: false, envFallback: "SMTP_SECURE" },
      { key: "user", label: "Username", kind: "text", secret: false, required: true, envFallback: "SMTP_USER" },
      { key: "pass", label: "Password / App password", kind: "secret", secret: true, required: true, envFallback: "SMTP_PASS" },
      { key: "from", label: "From address", kind: "text", secret: false, required: false, envFallback: "SMTP_FROM" },
    ],
  },
  {
    key: "recaptcha",
    category: IntegrationCategory.SECURITY,
    name: "Google reCAPTCHA",
    description: "Protect signup and enquiry forms from bots.",
    fields: [
      { key: "siteKey", label: "Site Key", kind: "text", secret: false, required: true, envFallback: "RECAPTCHA_SITE_KEY" },
      { key: "secretKey", label: "Secret Key", kind: "secret", secret: true, required: true, envFallback: "RECAPTCHA_SECRET_KEY" },
      { key: "enabled", label: "Enabled on signup", kind: "boolean", secret: false, required: false },
    ],
  },
  {
    key: "sembark",
    category: IntegrationCategory.SUPPLIERS,
    name: "Sembark",
    description: "CRM lead sync and inbound webhooks.",
    fields: [
      { key: "apiUrl", label: "API URL", kind: "url", secret: false, required: false, envFallback: "SEMBARK_API_URL" },
      { key: "apiKey", label: "API Key", kind: "secret", secret: true, required: false, envFallback: "SEMBARK_API_KEY" },
      { key: "webhookSecret", label: "Webhook Secret", kind: "secret", secret: true, required: false, envFallback: "SEMBARK_WEBHOOK_SECRET" },
      { key: "webhookUrl", label: "Outbound Webhook URL", kind: "url", secret: false, required: false, envFallback: "SEMBARK_WEBHOOK_URL" },
    ],
    webhooks: [{ eventType: "inbound", path: "/api/webhooks/sembark" }],
  },
  {
    key: "cloudinary",
    category: IntegrationCategory.SUPPLIERS,
    name: "Cloudinary",
    description: "Media uploads for packages, destinations, and gallery.",
    fields: [
      { key: "cloudName", label: "Cloud Name", kind: "text", secret: false, required: true, envFallback: "CLOUDINARY_CLOUD_NAME" },
      { key: "apiKey", label: "API Key", kind: "text", secret: false, required: true, envFallback: "CLOUDINARY_API_KEY" },
      { key: "apiSecret", label: "API Secret", kind: "secret", secret: true, required: true, envFallback: "CLOUDINARY_API_SECRET" },
    ],
  },
];

export function getBuiltinDefinition(key: string): BuiltinProviderDefinition | undefined {
  return BUILTIN_PROVIDERS.find((p) => p.key === key);
}

export function ferryOperatorDefinition(code: string, name: string): BuiltinProviderDefinition {
  return {
    key: `ferry:${code}`,
    category: IntegrationCategory.FERRY,
    name,
    description: `Ferry operator API credentials for ${name}.`,
    fields: [
      { key: "apiBaseUrl", label: "API Base URL", kind: "url", secret: false, required: true },
      { key: "apiKey", label: "API Key", kind: "secret", secret: true, required: true },
      { key: "apiSecret", label: "API Secret", kind: "secret", secret: true, required: false },
      { key: "enabled", label: "Enabled", kind: "boolean", secret: false, required: false },
    ],
  };
}
