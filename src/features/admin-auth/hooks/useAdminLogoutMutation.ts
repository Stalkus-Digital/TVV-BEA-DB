"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { adminSessionActions } from "../store/session";

export function useAdminLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminSessionActions.logout(),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: adminQueryKeys.session });
    },
  });
}
