import { err, ok, type Result } from "@/shared/types";
import { UnauthorizedError, ValidationError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { ensureIntegrationsSeeded, getIntegrationService } from "../module";
import type { IntegrationProviderDetail, IntegrationProviderSummary } from "../types/integration";

function requireAuth(context: AuthContext | null): Result<AuthContext, AppError> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return ok(context);
}

export async function listIntegrationsHandler(
  context: AuthContext | null
): Promise<Result<IntegrationProviderSummary[], AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  await ensureIntegrationsSeeded();
  return getIntegrationService().list();
}

export async function getIntegrationHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().getByKey(key);
}

export async function updateIntegrationHandler(
  context: AuthContext | null,
  key: string,
  body: unknown
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  if (typeof body !== "object" || body === null) return err(new ValidationError("Body must be an object"));
  const input = body as {
    config?: Record<string, unknown>;
    secrets?: Record<string, string>;
    status?: string;
  };
  return getIntegrationService().update(key, input, auth.value.userId);
}

export async function testIntegrationHandler(
  context: AuthContext | null,
  key: string,
  body: unknown = {}
): Promise<Result<{ ok: boolean; message: string }, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  const input =
    typeof body === "object" && body !== null
      ? (body as { config?: Record<string, unknown>; secrets?: Record<string, string> })
      : {};
  return getIntegrationService().testConnection(key, input, auth.value.userId);
}

export async function setActivePaymentHandler(
  context: AuthContext | null,
  body: unknown
): Promise<Result<{ activeProvider: string }, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  if (typeof body !== "object" || body === null) return err(new ValidationError("Body must be an object"));
  const provider = (body as { activeProvider?: string }).activeProvider;
  if (provider !== "razorpay" && provider !== "phonepe") {
    return err(new ValidationError("activeProvider must be razorpay or phonepe"));
  }
  return getIntegrationService().setActivePaymentProvider(provider, auth.value.userId);
}

export async function createFerryOperatorHandler(
  context: AuthContext | null,
  body: unknown
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  if (typeof body !== "object" || body === null) return err(new ValidationError("Body must be an object"));
  const { code, name } = body as { code?: string; name?: string };
  if (!code || !name) return err(new ValidationError("code and name are required"));
  return getIntegrationService().createFerryOperator({ code, name });
}

export async function listWebhookEventsHandler(
  context: AuthContext | null
): Promise<Result<Array<{ id: string; type: string; status: string; createdAt: string }>, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().listRecentWebhookEvents();
}

export async function deleteIntegrationHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<{ deleted: boolean }, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().deleteIntegration(key, auth.value.userId);
}

export async function enableIntegrationHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().setIntegrationEnabled(key, true, auth.value.userId);
}

export async function disableIntegrationHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().setIntegrationEnabled(key, false, auth.value.userId);
}

export async function resetCredentialsHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<IntegrationProviderDetail, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().resetCredentials(key, auth.value.userId);
}

export async function getConnectionHistoryHandler(
  context: AuthContext | null,
  key: string,
  limit: number = 50,
  offset: number = 0
): Promise<Result<{ entries: Array<{
  id: string;
  timestamp: string;
  operation: string;
  success: boolean;
  durationMs: number;
  httpStatus: number | null;
  summary: string;
  errorMessage: string | null;
}>; total: number }, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().getConnectionHistory(key, limit, offset);
}

export async function getHealthStatusHandler(
  context: AuthContext | null,
  key: string
): Promise<Result<{
  status: string;
  isAuthValid: boolean;
  lastCheckAt: string | null;
  responseTimeMs: number | null;
  consecutiveFailures: number;
}, AppError>> {
  const auth = requireAuth(context);
  if (!auth.ok) return auth;
  return getIntegrationService().getHealthStatus(key);
}
