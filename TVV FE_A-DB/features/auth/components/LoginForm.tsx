"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { AuthField } from "./AuthField";
import { AuthLayout } from "./AuthLayout";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { loginSchema, type LoginFormValues } from "../schemas";
import { useAuth } from "../store/session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { status } = useAuth();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, router, next]);

  if (status === "authenticated") return null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      router.replace(next);
    } catch {
      /* mutation error surfaced below */
    }
  });

  const serverError =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.error
        ? "Sign-in failed"
        : null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your bookings, save trips, and unlock member-only fares."
      footer={
        <span>
          New to The Vacation Voice?{" "}
          <Link href="/register" className="text-teal hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[13px] text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Forgot password?
          </Link>
        </div>
        {serverError && <AuthErrorAlert message={serverError} />}
        <Button type="submit" fullWidth disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
