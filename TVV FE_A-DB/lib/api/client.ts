/**
 * Travel OS HTTP client — fetch with timeout, retry, JWT attach, and refresh.
 *
 * Services consume this — components and hooks never call fetch directly.
 * Mock-mode short-circuiting lives in domain services, not here.
 */

import { apiConfig, endpoints } from "./config";
import { unwrapApiData } from "./envelope";
import { ApiError, fromStatus } from "./errors";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token";

interface RequestOptions extends Omit<RequestInit, "signal"> {
  timeoutMs?: number;
  retries?: number;
  treat404AsNull?: boolean;
  baseUrl?: string;
  noAuth?: boolean;
  /** Return `{ data, meta }` from the top-level API envelope. */
  withEnvelopeMeta?: boolean;
  /** Internal — prevents infinite refresh loops. */
  _retriedAfterRefresh?: boolean;
}

const AUTH_REFRESH_SKIP = new Set<string>([
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.refresh,
  endpoints.auth.logout,
  endpoints.auth.forgotPassword,
  endpoints.auth.resetPassword,
]);

let refreshInFlight: Promise<boolean> | null = null;

async function doFetch(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function authHeaders(noAuth?: boolean): Record<string, string> {
  if (noAuth) return {};
  const token = getAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

function shouldAttemptRefresh(path: string, noAuth?: boolean, retried?: boolean): boolean {
  if (noAuth || retried) return false;
  const normalized = path.startsWith("http") ? new URL(path).pathname : path.split("?")[0] ?? path;
  return !AUTH_REFRESH_SKIP.has(normalized);
}

async function attemptTokenRefresh(baseUrl: string, timeoutMs: number): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await doFetch(
        `${baseUrl}${endpoints.auth.refresh}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        },
        timeoutMs,
      );

      if (!res.ok) return false;

      const raw = await res.json();
      const data = unwrapApiData(raw) as Record<string, unknown>;
      const accessToken =
        (typeof data.accessToken === "string" && data.accessToken) ||
        (typeof data.access_token === "string" && data.access_token) ||
        null;
      const nextRefresh =
        (typeof data.refreshToken === "string" && data.refreshToken) ||
        (typeof data.refresh_token === "string" && data.refresh_token) ||
        refreshToken;

      if (!accessToken) return false;
      setTokens({ accessToken, refreshToken: nextRefresh });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
    const {
      timeoutMs = apiConfig.timeoutMs,
      retries = apiConfig.retries,
      treat404AsNull,
      baseUrl = apiConfig.baseUrl,
      withEnvelopeMeta,
      noAuth,
      _retriedAfterRefresh,
      headers,
      ...init
    } = options;

    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

    let attempt = 0;
    let lastError: ApiError | undefined;

    while (attempt <= retries) {
      try {
        const res = await doFetch(
          url,
          {
            ...init,
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              ...authHeaders(noAuth),
              ...headers,
            },
          },
          timeoutMs,
        );

        if (res.status === 401 && shouldAttemptRefresh(path, noAuth, _retriedAfterRefresh)) {
          const refreshed = await attemptTokenRefresh(baseUrl, timeoutMs);
          if (refreshed) {
            return this.request<T>(path, { ...options, _retriedAfterRefresh: true });
          }
          clearTokens();
        }

        if (res.status === 404 && treat404AsNull) return null;

        if (!res.ok) {
          const body = await safeJson(res);
          throw fromStatus(res.status, body);
        }

        if (res.status === 204) return null;

        const raw = await res.json();

        if (withEnvelopeMeta && raw && typeof raw === "object" && (raw as Record<string, unknown>).success === true) {
          const envelope = raw as { data: unknown; meta?: unknown };
          return { data: envelope.data, meta: envelope.meta } as T;
        }

        return unwrapApiData(raw) as T;
      } catch (err) {
        lastError = ApiError.fromUnknown(err);
        if (!lastError.retryable || attempt === retries) throw lastError;
        await delay(200 * Math.pow(2.2, attempt));
        attempt++;
      }
    }

    throw lastError ?? new ApiError("unknown", "Request failed");
  },

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T, B = unknown>(path: string, body: B, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T, B = unknown>(path: string, body: B, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },
};
