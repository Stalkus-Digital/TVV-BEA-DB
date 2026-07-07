import { adminApiClient } from "./client";
import { adminEndpoints } from "./endpoints";
import { ApiError } from "./errors";
import { clearTokens } from "./token";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  roles: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

interface TravelOsLoginResult {
  accessToken: string;
  refreshToken?: string | null;
  user: { id: string; email: string; fullName: string };
  roles: string[];
}

interface TravelOsAuthContext {
  userId: string;
  email: string;
  roles: string[];
}

/** Customer accounts must not access the admin dashboard. */
const STAFF_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "RESERVATIONS",
  "OPERATIONS",
  "FINANCE",
  "SUPPORT",
  "MARKETING",
  "SUPPLIER",
  "AGENT",
  "API",
]);

function assertStaffAccess(roles: string[]): void {
  if (!roles.some((role) => STAFF_ROLES.has(role))) {
    throw new ApiError("forbidden", "This account does not have admin dashboard access.");
  }
}

function toAdminUser(context: TravelOsAuthContext, fullName: string | null = null): AdminUser {
  return {
    id: context.userId,
    email: context.email,
    fullName,
    roles: context.roles,
  };
}

export async function adminLogin(input: LoginInput): Promise<{ user: AdminUser; accessToken: string; refreshToken: string | null }> {
  const body = await adminApiClient.post<TravelOsLoginResult>(adminEndpoints.auth.login, input, { noAuth: true });
  if (!body?.accessToken || !body.user) throw new ApiError("unknown", "Invalid login response");

  assertStaffAccess(body.roles);

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken ?? null,
    user: {
      id: body.user.id,
      email: body.user.email,
      fullName: body.user.fullName,
      roles: body.roles,
    },
  };
}

export async function fetchAdminSession(): Promise<AdminUser | null> {
  const context = await adminApiClient.get<TravelOsAuthContext>(adminEndpoints.auth.me, { treat404AsNull: true });
  if (!context) return null;

  assertStaffAccess(context.roles);
  return toAdminUser(context);
}

export async function adminLogout(): Promise<void> {
  try {
    await adminApiClient.post(adminEndpoints.auth.logout, {});
  } catch {
    // Clear local session even if server revoke fails.
  } finally {
    clearTokens();
  }
}
