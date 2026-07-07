const ACCESS_TOKEN_KEY = "tvv_admin_access_token";
const REFRESH_TOKEN_KEY = "tvv_admin_refresh_token";

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string | null;
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: StoredTokens) {
  writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
}
