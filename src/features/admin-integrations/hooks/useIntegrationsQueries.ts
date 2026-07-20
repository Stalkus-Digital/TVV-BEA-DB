"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFerryOperator,
  deleteIntegration,
  disableIntegration,
  enableIntegration,
  fetchIntegration,
  fetchIntegrations,
  fetchWebhookEvents,
  getConnectionHistory,
  getHealthStatus,
  resetCredentials,
  setActivePaymentProvider,
  testIntegration,
  updateIntegration,
} from "../api/integrations";

const keys = {
  list: ["admin", "integrations"] as const,
  detail: (key: string) => ["admin", "integrations", key] as const,
  webhooks: ["admin", "integrations", "webhooks"] as const,
};

export function useIntegrationsQuery() {
  return useQuery({
    queryKey: keys.list,
    queryFn: fetchIntegrations,
    staleTime: 30_000,
  });
}

export function useIntegrationDetailQuery(key: string | null) {
  return useQuery({
    queryKey: keys.detail(key ?? ""),
    queryFn: () => fetchIntegration(key!),
    enabled: Boolean(key),
  });
}

export function useWebhookEventsQuery(enabled: boolean) {
  return useQuery({
    queryKey: keys.webhooks,
    queryFn: fetchWebhookEvents,
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateIntegrationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      body,
    }: {
      key: string;
      body: { config?: Record<string, unknown>; secrets?: Record<string, string>; status?: string };
    }) => updateIntegration(key, body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: keys.list });
      qc.setQueryData(keys.detail(data.key), data);
    },
  });
}

export function useTestIntegrationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      body,
    }: {
      key: string;
      body?: { config?: Record<string, unknown>; secrets?: Record<string, string> };
    }) => testIntegration(key, body ?? {}),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: keys.list });
      void qc.invalidateQueries({ queryKey: keys.detail(variables.key) });
    },
  });
}

export function useSetActivePaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activeProvider: "razorpay" | "phonepe") => setActivePaymentProvider(activeProvider),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list });
      void qc.invalidateQueries({ queryKey: keys.detail("payments") });
    },
  });
}

export function useCreateFerryOperatorMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; name: string }) => createFerryOperator(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useEnableIntegrationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => enableIntegration(key),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: keys.list });
      qc.setQueryData(keys.detail(data.key), data);
    },
  });
}

export function useDisableIntegrationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => disableIntegration(key),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: keys.list });
      qc.setQueryData(keys.detail(data.key), data);
    },
  });
}

export function useDeleteIntegrationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteIntegration(key),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useResetCredentialsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => resetCredentials(key),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: keys.list });
      qc.setQueryData(keys.detail(data.key), data);
    },
  });
}

export function useHealthStatusQuery(key: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["admin", "integrations", key, "health"] as const,
    queryFn: () => getHealthStatus(key!),
    enabled: Boolean(key) && enabled,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useConnectionHistoryQuery(key: string | null, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ["admin", "integrations", key, "history", limit, offset] as const,
    queryFn: () => getConnectionHistory(key!, limit, offset),
    enabled: Boolean(key),
    staleTime: 15_000,
  });
}
