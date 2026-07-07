"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { AuthField } from "./AuthField";
import { AuthLayout } from "./AuthLayout";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";

export function ForgotPasswordForm() {
  const mutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Could not send reset email"
        : null;

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account and we will send reset instructions."
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/login" className="text-teal hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      {mutation.isSuccess ? (
        <div
          role="status"
          className="rounded-md border border-teal/20 bg-teal-light px-4 py-3 text-[14px] text-ink"
        >
          If an account exists for that email, reset instructions are on their way.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          {serverError && <AuthErrorAlert message={serverError} />}
          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
