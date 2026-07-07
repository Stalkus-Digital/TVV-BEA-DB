"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLogin, type LoginInput } from "@/lib/admin-api/auth";
import { ApiError } from "@/lib/admin-api/errors";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { adminSessionActions } from "../store/session";

export function useAdminLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => adminLogin(input),
    onMutate: () => adminSessionActions.setLoading(),
    onSuccess: ({ user, accessToken, refreshToken }) => {
      adminSessionActions.setAuthenticated(user, accessToken, refreshToken);
      queryClient.setQueryData(adminQueryKeys.session, user);
    },
    onError: () => {
      adminSessionActions.clear();
    },
    meta: {
      errorMessage: (err: unknown) => (err instanceof ApiError ? err.message : "Sign-in failed"),
    },
  });
}
