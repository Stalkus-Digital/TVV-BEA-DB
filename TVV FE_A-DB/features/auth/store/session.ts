"use client";

import { useSyncExternalStore } from "react";
import { clearTokens, getAccessToken, setTokens } from "@/lib/api";
import { fetchSession, type CustomerUser } from "@/lib/api/auth";

export type { CustomerUser };

type Status = "anonymous" | "authenticated" | "loading";

interface State {
  user: CustomerUser | null;
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
    const user = await fetchSession();
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

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const sessionActions = {
  setAuthenticated(user: CustomerUser, accessToken: string, refreshToken?: string | null) {
    setTokens({ accessToken, refreshToken });
    set({ user, status: "authenticated", hydrated: true });
  },

  setUser(user: CustomerUser) {
    set({ user, status: "authenticated" });
  },

  setLoading() {
    set({ status: "loading" });
  },

  clear() {
    clearTokens();
    set({ user: null, status: "anonymous" });
  },

  async logout() {
    const { logout } = await import("@/lib/api/auth");
    await logout();
    this.clear();
    if (typeof window !== "undefined") window.location.href = "/";
  },

  async refresh() {
    return hydrateFromToken();
  },
};

/** @deprecated Use `sessionActions` */
export const authActions = {
  async login(email: string, password: string) {
    const { login } = await import("@/lib/api/auth");
    sessionActions.setLoading();
    try {
      const { access_token, refresh_token, user } = await login({ email, password });
      sessionActions.setAuthenticated(user, access_token, refresh_token);
      return user;
    } catch (err) {
      sessionActions.clear();
      throw err;
    }
  },

  async register(input: { email: string; password: string; name?: string; phone?: string }) {
    const { register } = await import("@/lib/api/auth");
    sessionActions.setLoading();
    try {
      const { access_token, refresh_token, user } = await register(input);
      sessionActions.setAuthenticated(user, access_token, refresh_token);
      return user;
    } catch (err) {
      sessionActions.clear();
      throw err;
    }
  },

  async updateProfile(patch: { name?: string; phone?: string | null }) {
    const { updateProfile } = await import("@/lib/api/users");
    const updated = await updateProfile(patch);
    // Travel OS's profile PATCH response has no RBAC `role` — preserve the existing session's.
    const user: CustomerUser = { ...updated, role: state.user?.role ?? null };
    sessionActions.setUser(user);
    return user;
  },

  logout() {
    void sessionActions.logout();
  },

  refresh() {
    return sessionActions.refresh();
  },
};
