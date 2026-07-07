"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangePasswordInput, UpdateProfileInput } from "@/lib/api/users";
import { queryKeys } from "@/shared/lib/query-keys";
import { sessionActions, useAuth } from "@/features/auth";
import { dashboardFeatureService } from "../services/dashboard.feature.service";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => dashboardFeatureService.profile.update(input),
    onSuccess: (updated) => {
      // Travel OS's profile PATCH response has no RBAC `role` field — preserve
      // whatever the current session already knows, since this update can't change it.
      const merged = { ...currentUser, ...updated, role: currentUser?.role ?? null };
      sessionActions.setUser(merged);
      queryClient.setQueryData(queryKeys.customer.me, merged);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => dashboardFeatureService.profile.changePassword(input),
  });
}
