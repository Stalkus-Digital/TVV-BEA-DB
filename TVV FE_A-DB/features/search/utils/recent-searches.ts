const STORAGE_KEY = "tvv-recent-searches";
const MAX_RECENT = 6;
const EMPTY: string[] = [];

// Cache keyed on the raw localStorage string so `getRecentSearches` (used as
// useSyncExternalStore's getSnapshot) returns a reference-stable array when
// the underlying storage hasn't actually changed, per React's snapshot contract.
let cachedRaw: string | null = null;
let cachedItems: string[] = EMPTY;

function readStorage(): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    if (!raw) {
      cachedItems = EMPTY;
    } else {
      const parsed = JSON.parse(raw) as unknown;
      cachedItems = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : EMPTY;
    }
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeStorage(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

export function getRecentSearches(): string[] {
  return readStorage();
}

export function addRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return readStorage();
  const next = [trimmed, ...readStorage().filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_RECENT,
  );
  writeStorage(next);
  return next;
}

export function removeRecentSearch(query: string): string[] {
  const next = readStorage().filter((item) => item !== query);
  writeStorage(next);
  return next;
}

export function clearRecentSearches(): void {
  writeStorage([]);
}
