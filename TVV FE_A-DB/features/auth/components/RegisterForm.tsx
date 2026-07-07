"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { AuthField } from "./AuthField";
import { AuthLayout } from "./AuthLayout";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useAuth } from "../store/session";

export function RegisterForm() {
  const router = useRouter();
  const { status } = useAuth();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") return null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        name: values.name || undefined,
        phone: values.phone || undefined,
      });
      router.replace("/dashboard");
    } catch {
      /* surfaced below */
    }
  });

  const serverError =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.error
        ? "Registration failed"
        : null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A single account for booking, saved trips, and concierge support."
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="text-teal hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthField
          id="register-name"
          label="Full name"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          id="register-phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <AuthField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {serverError && <AuthErrorAlert message={serverError} />}
        <Button type="submit" fullWidth disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-[12px] text-ink-muted">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
