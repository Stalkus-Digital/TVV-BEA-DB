import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { unwrapApiData } from "@/lib/admin-api/envelope";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/admin-api/token";

function parseApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  const error = record.error;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  return fallback;
}

async function attemptTokenRefresh(): Promise<boolean> {
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
  }
}

async function authenticatedFetch(
  url: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (!headers.has("accept")) headers.set("accept", "*/*");

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !retried) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) return authenticatedFetch(url, init, true);
    clearTokens();
  }

  return res;
}

export async function downloadCatalogExport(filters: {
  kind?: string;
  destinationId?: string;
  status?: string;
  search?: string;
  modules?: string[];
}): Promise<void> {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.destinationId) params.set("destinationId", filters.destinationId);
  if (filters.status) params.set("status", filters.status);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.modules?.length) params.set("modules", filters.modules.join(","));

  const qs = params.toString();
  const res = await authenticatedFetch(`/api/admin/inventory/export${qs ? `?${qs}` : ""}`);

  if (!res.ok) {
    let message = "Export failed";
    try {
      const body = await res.json();
      message = parseApiErrorMessage(body, message);
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `tvv-catalog-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function uploadCatalogImport(file: File): Promise<{
  successful: number;
  failed: number;
  errors: string[];
  byType?: Record<string, { successful: number; failed: number }>;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authenticatedFetch("/api/admin/inventory/upload", {
    method: "POST",
    body: formData,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiErrorMessage(body, "Upload failed"));
  }

  return body as {
    successful: number;
    failed: number;
    errors: string[];
    byType?: Record<string, { successful: number; failed: number }>;
  };
}
