import { unwrapApiData } from "./envelope";
import { adminEndpoints } from "./endpoints";
import { ApiError, fromStatus } from "./errors";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token";

interface RequestOptions extends Omit<RequestInit, "signal"> {
  noAuth?: boolean;
  treat404AsNull?: boolean;
  _retriedAfterRefresh?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

const AUTH_REFRESH_SKIP = new Set<string>([
  adminEndpoints.auth.login,
  adminEndpoints.auth.refresh,
  adminEndpoints.auth.logout,
]);

let refreshInFlight: Promise<boolean> | null = null;

function authHeaders(noAuth?: boolean): Record<string, string> {
  if (noAuth) return {};
  const token = getAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(adminEndpoints.auth.refresh, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const raw = await res.json();
      const data = unwrapApiData(raw) as Record<string, unknown>;
      const accessToken = typeof data.accessToken === "string" ? data.accessToken : null;
      const nextRefresh =
        (typeof data.refreshToken === "string" && data.refreshToken) || refreshToken;

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

export const adminApiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
    const { noAuth, treat404AsNull, _retriedAfterRefresh, headers, params, ...init } = options;
    const url = buildUrl(path, params);

    const res = await fetch(url, {
      ...init,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...authHeaders(noAuth),
        ...headers,
      },
    });

    if (res.status === 401 && !noAuth && !_retriedAfterRefresh && !AUTH_REFRESH_SKIP.has(path)) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        return this.request<T>(path, { ...options, _retriedAfterRefresh: true });
      }
      clearTokens();
    }

    if (res.status === 404 && treat404AsNull) return null;

    if (!res.ok) {
      throw fromStatus(res.status, await safeJson(res));
    }

    if (res.status === 204) return null;

    const raw = await res.json();
    return unwrapApiData(raw) as T;
  },

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T, B = unknown>(path: string, body: B, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) });
  },

  patch<T, B = unknown>(path: string, body: B, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) });
  },

  put<T, B = unknown>(path: string, body: B, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) });
  },

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },
};
