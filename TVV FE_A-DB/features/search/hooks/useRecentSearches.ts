"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "../utils/recent-searches";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("tvv-recent-searches", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("tvv-recent-searches", onStoreChange);
  };
}

function notifyRecentSearchesChanged() {
  window.dispatchEvent(new Event("tvv-recent-searches"));
}

const EMPTY_RECENT_SEARCHES: string[] = [];
function getServerSnapshot() {
  return EMPTY_RECENT_SEARCHES;
}

export function useRecentSearches() {
  const items = useSyncExternalStore(subscribe, getRecentSearches, getServerSnapshot);

  const add = useCallback((query: string) => {
    addRecentSearch(query);
    notifyRecentSearchesChanged();
  }, []);

  const remove = useCallback((query: string) => {
    removeRecentSearch(query);
    notifyRecentSearchesChanged();
  }, []);

  const clear = useCallback(() => {
    clearRecentSearches();
    notifyRecentSearchesChanged();
  }, []);

  return { items, add, remove, clear };
}
