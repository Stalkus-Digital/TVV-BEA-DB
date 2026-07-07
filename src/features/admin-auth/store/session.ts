"use client";

import { useSyncExternalStore } from "react";
import { clearTokens, getAccessToken, setTokens } from "@/lib/admin-api";
import type { AdminUser } from "@/lib/admin-api/auth";

export type { AdminUser };

type Status = "anonymous" | "authenticated" | "loading";

interface State {
  user: AdminUser | null;
  status: Status;
  hydrated: boolean;
}

let state: State = { user: null, status: "anonymous", hydrated: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

const SERVER_SNAPSHOT: State = { user: null, status: "anonymous", hydrated: false };

function getServerSnapshot(): State {
  return SERVER_SNAPSHOT;
}

async function hydrateFromToken() {
  if (state.hydrated) return;
  set({ hydrated: true });

  const token = getAccessToken();
  if (!token) return;

  set({ status: "loading" });
  try {
    const { fetchAdminSession } = await import("@/lib/admin-api/auth");
    const user = await fetchAdminSession();
    if (!user) throw new Error("Session expired");
    set({ user, status: "authenticated" });
  } catch {
    clearTokens();
    set({ user: null, status: "anonymous" });
  }
}

if (typeof window !== "undefined") {
  void hydrateFromToken();
}

export function useAdminAuth() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const adminSessionActions = {
  setAuthenticated(user: AdminUser, accessToken: string, refreshToken?: string | null) {
    setTokens({ accessToken, refreshToken });
    set({ user, status: "authenticated", hydrated: true });
  },

  setLoading() {
    set({ status: "loading" });
  },

  clear() {
    clearTokens();
    set({ user: null, status: "anonymous" });
  },

  async logout() {
    const { adminLogout } = await import("@/lib/admin-api/auth");
    await adminLogout();
    this.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
  },
};
