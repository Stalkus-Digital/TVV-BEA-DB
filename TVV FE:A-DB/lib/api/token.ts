const ACCESS_TOKEN_KEY = "tvv_access_token";
const REFRESH_TOKEN_KEY = "tvv_refresh_token";
/** @deprecated Legacy key — migrated on read, cleared on write. */
const LEGACY_TOKEN_KEY = "tvv_customer_token";

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

/** Migrate a token stored under the pre–Travel OS key. */
function migrateLegacyAccessToken(): string | null {
  const legacy = readStorage(LEGACY_TOKEN_KEY);
  if (!legacy) return null;
  writeStorage(ACCESS_TOKEN_KEY, legacy);
  removeStorage(LEGACY_TOKEN_KEY);
  return legacy;
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_TOKEN_KEY) ?? migrateLegacyAccessToken();
}

/** @deprecated Use `getAccessToken`. */
export function getStoredToken(): string | null {
  return getAccessToken();
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: StoredTokens) {
  writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
  removeStorage(LEGACY_TOKEN_KEY);
}

/** @deprecated Use `setTokens({ accessToken })`. */
export function setStoredToken(accessToken: string) {
  setTokens({ accessToken, refreshToken: getRefreshToken() });
}

export function clearTokens() {
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(LEGACY_TOKEN_KEY);
}

/** @deprecated Use `clearTokens`. */
export function clearStoredToken() {
  clearTokens();
}
