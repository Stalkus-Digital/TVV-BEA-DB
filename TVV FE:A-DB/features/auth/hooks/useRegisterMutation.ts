"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { register, type RegisterInput } from "@/lib/api/auth";
import { queryKeys } from "@/shared/lib/query-keys";
import { sessionActions } from "../store/session";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onMutate: () => sessionActions.setLoading(),
    onSuccess: ({ access_token, refresh_token, user }) => {
      sessionActions.setAuthenticated(user, access_token, refresh_token);
      queryClient.setQueryData(queryKeys.customer.me, user);
    },
    onError: () => {
      sessionActions.clear();
    },
    meta: {
      errorMessage: (err: unknown) =>
        err instanceof ApiError ? err.message : "Registration failed",
    },
  });
}
