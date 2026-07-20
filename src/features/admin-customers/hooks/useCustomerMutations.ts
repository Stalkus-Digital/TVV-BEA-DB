"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveCustomer,
  bulkArchiveCustomers,
  createCustomer,
  createCustomerNote,
  restoreCustomer,
  updateCustomer,
} from "../api/users";
import { adminQueryKeys } from "@/shared/lib/query-client";

function invalidateCustomerQueries(queryClient: ReturnType<typeof useQueryClient>, userId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.detail(userId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.notes(userId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.payments(userId) });
  }
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => invalidateCustomerQueries(queryClient),
  });
}

export function useUpdateCustomerMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateCustomer>[1]) => updateCustomer(userId, data),
    onSuccess: () => invalidateCustomerQueries(queryClient, userId),
  });
}

export function useArchiveCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveCustomer,
    onSuccess: (_data, id) => invalidateCustomerQueries(queryClient, id),
  });
}

export function useRestoreCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreCustomer,
    onSuccess: (_data, id) => invalidateCustomerQueries(queryClient, id),
  });
}

export function useBulkArchiveCustomersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkArchiveCustomers,
    onSuccess: () => invalidateCustomerQueries(queryClient),
  });
}

export function useCreateCustomerNoteMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createCustomerNote(userId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.notes(userId) });
    },
  });
}
