"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminLoginMutation } from "../hooks/useAdminLoginMutation";
import { useAdminAuth } from "../store/session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { status } = useAdminAuth();
  const loginMutation = useAdminLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, router, next]);

  if (status === "authenticated") return null;

  const serverError = loginMutation.error
    ? loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Sign-in failed"
    : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    if (!email.trim() || !password) {
      setFieldError("Email and password are required.");
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      router.replace(next);
    } catch {
      /* surfaced via serverError */
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-bold text-2xl tracking-tight mb-2">
            <span className="text-primary">The</span> Vacation Voice
          </div>
          <p className="text-sm text-muted-foreground">Admin Dashboard — sign in to continue</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Use your staff account credentials.</p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="admin@tvv-travel-os.local"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {(fieldError || serverError) && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {fieldError ?? serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
