/**
 * Integration Status Engine
 *
 * Defines the true operational state of integrations, backed by real provider
 * validation—never based solely on credential existence.
 */

export const IntegrationStatusEnum = {
  NOT_CONFIGURED: "NOT_CONFIGURED",
  CONFIGURED: "CONFIGURED",
  TESTING: "TESTING",
  CONNECTED: "CONNECTED",
  FAILED: "FAILED",
  DISABLED: "DISABLED",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  RATE_LIMITED: "RATE_LIMITED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  WARNING: "WARNING",
  UNKNOWN: "UNKNOWN",
} as const;

export type IntegrationStatus = (typeof IntegrationStatusEnum)[keyof typeof IntegrationStatusEnum];

/**
 * Health information for an integration.
 * Provides detailed status beyond just the status badge.
 */
export interface IntegrationHealth {
  /** Current operational status */
  status: IntegrationStatus;

  /** Human-readable health description */
  health: string;

  /** Secrets configured count */
  configuredSecrets: number;

  /** Total required secrets */
  requiredSecrets: number;

  /** When the connection was last tested (ISO 8601) */
  lastTestedAt: string | null;

  /** Last error message (if status is FAILED) */
  lastError: string | null;

  /** Whether the last test succeeded */
  lastTestOk: boolean | null;
}

/**
 * Connection details for enterprise visibility
 */
export interface ConnectionDetails {
  /** Authentication method used */
  authMethod: string | null;

  /** Current endpoint being used */
  endpoint: string | null;

  /** Provider version if available */
  providerVersion: string | null;

  /** Response time in ms from last test */
  responseTimeMs: number | null;

  /** Environment: sandbox, staging, production */
  environment: "sandbox" | "staging" | "production" | "unknown";

  /** Last successful test timestamp */
  lastSuccessAt: string | null;

  /** Last failed test timestamp */
  lastFailureAt: string | null;

  /** Webhook status (if applicable) */
  webhookStatus: "configured" | "unconfigured" | "failed" | "unknown" | null;

  /** Last webhook test result */
  lastWebhookTestAt: string | null;
}

/**
 * Connection history entry for audit trail
 */
export interface ConnectionHistoryEntry {
  id: string;
  integrationKey: string;
  timestamp: string;
  operation: "test" | "configure" | "enable" | "disable" | "reset" | "delete" | "health_check" | "retry";
  success: boolean;
  durationMs: number;
  httpStatus: number | null;
  userId: string | null;
  summary: string;
  errorMessage: string | null;
  providerResponse: string | null; // Sanitized response
}

/**
 * Status transitions diagram:
 *
 * [NOT_CONFIGURED] (no secrets entered)
 *    ↓
 *    └→ User enters credentials
 *
 * [CONFIGURED] (all required secrets exist, but never tested)
 *    ↓
 *    ├→ Admin clicks "Test Connection"
 *    │
 * [TESTING] (connection test in progress)
 *    │  ├→ Test succeeds
 *    │  │
 *    │  └→ [CONNECTED]
 *    │      ├→ User updates credentials
 *    │      │  └→ [CONFIGURED] (re-test required)
 *    │      │
 *    │      └→ Stays CONNECTED until credentials change
 *    │
 *    └→ Test fails
 *       │
 *       └→ [FAILED]
 *          ├→ User fixes credentials
 *          │  └→ [CONFIGURED] (ready to re-test)
 *          │
 *          └→ Re-test fails
 *             └→ [FAILED] (stays in failed state)
 *
 * [DISABLED] (admin intentionally disabled)
 *    └→ Admin re-enables
 *       └→ [CONFIGURED] (ready to test)
 */

/**
 * Base interface for provider-specific test validation.
 * Each provider implements this to perform real connectivity checks.
 */
export interface ProviderValidator {
  /**
   * Test real connectivity to the provider.
   * Must perform actual API calls, not just credential validation.
   *
   * Returns:
   * - { ok: true, message: "..." } on success
   * - { ok: false, message: "..." } on failure (error details)
   */
  testConnection(secrets: Record<string, string>): Promise<{ ok: boolean; message: string }>;
}
