"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFerryOperator,
  fetchIntegration,
  fetchIntegrations,
  fetchWebhookEvents,
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
    mutationFn: (key: string) => testIntegration(key),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list });
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
