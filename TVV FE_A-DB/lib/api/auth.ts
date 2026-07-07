import { apiClient } from "./client";
import { endpoints } from "./config";

export interface CustomerUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string | null;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token?: string | null;
  user: CustomerUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

interface TravelOsLoginResult {
  accessToken: string;
  refreshToken?: string | null;
  user: { id: string; email: string; fullName: string };
  roles: string[];
}

interface TravelOsPublicUser {
  id: string;
  email: string;
  fullName: string;
}

interface TravelOsAuthContext {
  userId: string;
  email: string;
  roles: string[];
}

function toAuthTokenResponse(result: TravelOsLoginResult): AuthTokenResponse {
  return {
    access_token: result.accessToken,
    refresh_token: result.refreshToken ?? null,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.fullName,
      phone: null,
      role: result.roles[0] ?? null,
    },
  };
}

export async function login(input: LoginInput): Promise<AuthTokenResponse> {
  const body = await apiClient.post<TravelOsLoginResult>(endpoints.auth.login, input, { noAuth: true });
  if (!body?.accessToken || !body.user) throw new Error("Invalid login response");
  return toAuthTokenResponse(body);
}

/** Travel OS register returns the user only — compose with login for immediate session. */
export async function register(input: RegisterInput): Promise<AuthTokenResponse> {
  const created = await apiClient.post<TravelOsPublicUser>(
    endpoints.auth.register,
    { email: input.email, password: input.password, fullName: input.name },
    { noAuth: true },
  );
  if (!created?.id) throw new Error("Invalid register response");
  return login({ email: input.email, password: input.password });
}

/** `/api/auth/me` returns auth context — `name` is unavailable until self-service profile exists. */
export async function fetchSession(): Promise<CustomerUser | null> {
  const context = await apiClient.get<TravelOsAuthContext>(endpoints.auth.me, { treat404AsNull: true });
  if (!context) return null;
  return {
    id: context.userId,
    email: context.email,
    name: null,
    phone: null,
    role: context.roles[0] ?? null,
  };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(endpoints.auth.logout, {});
  } catch {
    // Clear local session even if server revoke fails (offline / expired token).
  }
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<{ ok: true }> {
  await apiClient.post(endpoints.auth.forgotPassword, input, { noAuth: true });
  return { ok: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ ok: true }> {
  await apiClient.post(
    endpoints.auth.resetPassword,
    { token: input.token, newPassword: input.password },
    { noAuth: true },
  );
  return { ok: true };
}
