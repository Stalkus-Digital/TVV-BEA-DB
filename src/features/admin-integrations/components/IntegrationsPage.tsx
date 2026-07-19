"use client";

import { useMemo, useState } from "react";
import { OperationsPageShell } from "@/features/admin-operations/components/OperationsPageShell";
import { CATEGORY_TABS, type IntegrationProviderSummary } from "../types";
import {
  useCreateFerryOperatorMutation,
  useIntegrationsQuery,
  useSetActivePaymentMutation,
  useWebhookEventsQuery,
} from "../hooks/useIntegrationsQueries";
import { ProviderConfigureDrawer } from "./ProviderConfigureDrawer";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    CONNECTED: "bg-emerald-100 text-emerald-800",
    DISCONNECTED: "bg-slate-100 text-slate-600",
    ERROR: "bg-red-100 text-red-800",
    DISABLED: "bg-amber-100 text-amber-800",
  };
  return styles[status] ?? "bg-slate-100 text-slate-600";
}

export function IntegrationsPage() {
  const [tab, setTab] = useState<(typeof CATEGORY_TABS)[number]["id"]>("ALL");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ferryCode, setFerryCode] = useState("");
  const [ferryName, setFerryName] = useState("");

  const listQuery = useIntegrationsQuery();
  const webhooksQuery = useWebhookEventsQuery(tab === "WEBHOOKS");
  const setActivePayment = useSetActivePaymentMutation();
  const createFerry = useCreateFerryOperatorMutation();

  const items = listQuery.data ?? [];
  const paymentsSystem = items.find((i) => i.key === "payments");
  const activeProvider =
    (paymentsSystem?.config?.activeProvider as string | undefined) === "phonepe" ? "phonepe" : "razorpay";

  const filtered = useMemo(() => {
    if (tab === "ALL") return items.filter((i) => i.key !== "payments");
    if (tab === "WEBHOOKS") return items.filter((i) => (i.config && false) || i.key === "razorpay" || i.key === "phonepe" || i.key === "sembark");
    if (tab === "PAYMENTS") return items.filter((i) => i.category === "PAYMENTS" && i.key !== "payments");
    return items.filter((i) => i.category === tab);
  }, [items, tab]);

  return (
    <OperationsPageShell
      title="Integrations"
      description="Connect OpenAI (AI package builder), payment gateways, TripJack, Sembark CRM leads, ferry operators, email, and security. Status shows CONNECTED only after you save credentials and pass Test."
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={listQuery.error instanceof Error ? listQuery.error.message : undefined}
      onRetry={() => void listQuery.refetch()}
      onRefresh={() => void listQuery.refetch()}
      isRefreshing={listQuery.isFetching}
    >
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {CATEGORY_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-ink text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "PAYMENTS" && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Active payment gateway</h2>
          <p className="text-xs text-muted-foreground">
            Website checkout uses exactly one gateway at a time. Configure both providers below, then choose which is active.
          </p>
          <div className="flex flex-wrap gap-3">
            {(["razorpay", "phonepe"] as const).map((provider) => (
              <label
                key={provider}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  activeProvider === provider ? "border-teal-600 bg-teal-50" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="activePayment"
                  checked={activeProvider === provider}
                  disabled={setActivePayment.isPending}
                  onChange={() => setActivePayment.mutate(provider)}
                />
                {provider === "razorpay" ? "Razorpay" : "PhonePe"}
              </label>
            ))}
          </div>
          {setActivePayment.isSuccess && (
            <p className="text-xs text-emerald-700">Active gateway updated to {setActivePayment.data.activeProvider}.</p>
          )}
        </div>
      )}

      {tab === "FERRY" && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Add ferry company</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Code (e.g. makruzz)"
              value={ferryCode}
              onChange={(e) => setFerryCode(e.target.value)}
            />
            <input
              className="rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
              placeholder="Display name"
              value={ferryName}
              onChange={(e) => setFerryName(e.target.value)}
            />
            <button
              type="button"
              disabled={createFerry.isPending || !ferryCode.trim() || !ferryName.trim()}
              onClick={() =>
                createFerry.mutate(
                  { code: ferryCode, name: ferryName },
                  {
                    onSuccess: () => {
                      setFerryCode("");
                      setFerryName("");
                    },
                  }
                )
              }
              className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Add operator
            </button>
          </div>
          {createFerry.isError && (
            <p className="text-xs text-red-600">
              {createFerry.error instanceof Error ? createFerry.error.message : "Could not create operator"}
            </p>
          )}
        </div>
      )}

      {tab === "WEBHOOKS" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold mb-2">Inbound webhook endpoints</h2>
            <ul className="space-y-2 text-sm">
              {filtered.flatMap((p) =>
                (p.key === "razorpay"
                  ? ["/api/webhooks/razorpay"]
                  : p.key === "phonepe"
                    ? ["/api/webhooks/phonepe"]
                    : p.key === "sembark"
                      ? ["/api/webhooks/sembark"]
                      : []
                ).map((path) => (
                  <li key={`${p.key}-${path}`} className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span>
                      {p.name}: {path}
                    </span>
                    <button
                      type="button"
                      className="text-teal-700 hover:underline"
                      onClick={() => void navigator.clipboard.writeText(`${window.location.origin}${path}`)}
                    >
                      Copy
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold mb-2">Recent webhook events</h2>
            {webhooksQuery.isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!webhooksQuery.isLoading && (webhooksQuery.data?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No webhook events recorded yet.</p>
            )}
            <ul className="divide-y divide-border text-sm">
              {webhooksQuery.data?.map((ev) => (
                <li key={ev.id} className="py-2 flex justify-between gap-2">
                  <span className="font-mono text-xs">{ev.type}</span>
                  <span className="text-xs text-muted-foreground">{ev.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab !== "WEBHOOKS" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onConfigure={() => setSelectedKey(provider.key)} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No integrations in this category.</p>
          )}
        </div>
      )}

      <ProviderConfigureDrawer providerKey={selectedKey} onClose={() => setSelectedKey(null)} />
    </OperationsPageShell>
  );
}

function ProviderCard({
  provider,
  onConfigure,
}: {
  provider: IntegrationProviderSummary;
  onConfigure: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">{provider.name}</h3>
          {provider.description ? (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{provider.description}</p>
          ) : null}
        </div>
        <span className={`shrink-0 text-[10px] font-medium rounded-full px-2 py-0.5 ${statusBadge(provider.status)}`}>
          {provider.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Secrets {provider.secretsConfigured}/{provider.secretsTotal}
        {provider.lastTestedAt
          ? ` · Last test ${provider.lastTestOk ? "ok" : "failed"}`
          : ""}
      </p>
      <button
        type="button"
        onClick={onConfigure}
        className="mt-auto self-start rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
      >
        Configure
      </button>
    </div>
  );
}
