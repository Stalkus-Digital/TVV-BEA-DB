"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { requestPasswordReset, type ForgotPasswordInput } from "@/lib/api/auth";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => requestPasswordReset(input),
    meta: {
      errorMessage: (err: unknown) =>
        err instanceof ApiError ? err.message : "Could not send reset email",
    },
  });
}
