"use client";

import { useMemo, useState } from "react";
import { Trash2, Play, Pause, RotateCcw, ChevronDown, ChevronUp, Clock, AlertCircle, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { OperationsPageShell } from "@/features/admin-operations/components/OperationsPageShell";
import { CATEGORY_TABS, type IntegrationProviderSummary } from "../types";
import {
  useConnectionHistoryQuery,
  useCreateFerryOperatorMutation,
  useDeleteIntegrationMutation,
  useDisableIntegrationMutation,
  useEnableIntegrationMutation,
  useHealthStatusQuery,
  useIntegrationsQuery,
  useResetCredentialsMutation,
  useSetActivePaymentMutation,
  useTestIntegrationMutation,
  useWebhookEventsQuery,
} from "../hooks/useIntegrationsQueries";
import { ProviderConfigureDrawer } from "./ProviderConfigureDrawer";
import { ConnectionDetailsPanel } from "./ConnectionDetailsPanel";
import { ErrorMessagePanel } from "./ErrorMessagePanel";
import { IntegrationStats } from "./IntegrationStats";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    CONNECTED: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    CONFIGURED: "bg-blue-100 text-blue-800 border border-blue-300",
    NOT_CONFIGURED: "bg-slate-100 text-slate-600 border border-slate-300",
    FAILED: "bg-red-100 text-red-800 border border-red-300",
    TESTING: "bg-amber-100 text-amber-800 border border-amber-300",
    DISABLED: "bg-amber-100 text-amber-800 border border-amber-300",
    AUTHENTICATION_FAILED: "bg-red-100 text-red-800 border border-red-300",
    RATE_LIMITED: "bg-orange-100 text-orange-800 border border-orange-300",
    SERVICE_UNAVAILABLE: "bg-red-100 text-red-800 border border-red-300",
    WARNING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    UNKNOWN: "bg-slate-100 text-slate-600 border border-slate-300",
  };
  return styles[status] ?? "bg-slate-100 text-slate-600 border border-slate-300";
}

function statusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    CONNECTED: "Connection tested and active",
    CONFIGURED: "Credentials saved, ready to test",
    NOT_CONFIGURED: "Add credentials to get started",
    FAILED: "Last test failed, check credentials",
    TESTING: "Running connection test...",
    DISABLED: "Integration disabled",
    AUTHENTICATION_FAILED: "Authentication failed, review credentials",
    RATE_LIMITED: "API rate limit reached, retry later",
    SERVICE_UNAVAILABLE: "Provider service unavailable",
    WARNING: "Connection warning, review details",
    UNKNOWN: "Status unknown, test connection",
  };
  return descriptions[status] ?? "Unknown status";
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
      description="Connect third-party services securely. Each integration requires credentials saved to vault, then validated via Test. Status indicators show CONNECTED (tested), CONFIGURED (ready to test), or FAILED (needs attention). Expand cards to view health metrics, recent operations, and error remediation."
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

      {/* Integration Stats Dashboard */}
      {tab !== "WEBHOOKS" && tab !== "PAYMENTS" && tab !== "FERRY" && items.length > 0 && (
        <div className="mt-4">
          <IntegrationStats integrations={filtered} />
        </div>
      )}

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
            <ProviderCard
              key={provider.id}
              provider={provider}
              onConfigure={() => setSelectedKey(provider.key)}
            />
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
  const [expanded, setExpanded] = useState(false);
  const enable = useEnableIntegrationMutation();
  const disable = useDisableIntegrationMutation();
  const deleteInteg = useDeleteIntegrationMutation();
  const reset = useResetCredentialsMutation();
  const test = useTestIntegrationMutation();
  const health = useHealthStatusQuery(provider.key, expanded);
  const history = useConnectionHistoryQuery(provider.key, 5);

  const isBuiltin = provider.key === "payments" || ["openai", "razorpay", "phonepe", "tripjack", "smtp", "recaptcha", "sembark", "cloudinary"].includes(provider.key);
  const isDisabled = provider.status === "DISABLED";

  const lastTestTime = provider.lastTestedAt ? new Date(provider.lastTestedAt) : null;
  const timeAgo = lastTestTime ? Math.floor((Date.now() - lastTestTime.getTime()) / 1000) : null;
  const timeAgoStr = timeAgo ? (
    timeAgo < 60 ? `${timeAgo}s ago` :
    timeAgo < 3600 ? `${Math.floor(timeAgo / 60)}m ago` :
    timeAgo < 86400 ? `${Math.floor(timeAgo / 3600)}h ago` :
    `${Math.floor(timeAgo / 86400)}d ago`
  ) : null;

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-2 border-b border-border">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{provider.name}</h3>
          {provider.description ? (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{provider.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium rounded px-2 py-1 ${statusBadge(provider.status)}`}>
            {provider.status}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-4 py-3 bg-muted/30 flex flex-col gap-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Secrets:</span>
          <span className="font-medium">{provider.secretsConfigured}/{provider.secretsTotal}</span>
        </div>
        {provider.lastTestedAt && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Last test:</span>
            <span className={provider.lastTestOk ? "text-emerald-600" : "text-red-600"} title={provider.lastTestedAt}>
              {provider.lastTestOk ? "✓" : "✗"} {timeAgoStr}
            </span>
          </div>
        )}
        {!provider.lastTestOk && provider.lastTestMessage && (
          <div className="flex items-start gap-2 text-xs bg-red-50 text-red-700 rounded p-2 border border-red-200">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{provider.lastTestMessage}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-border">
        <button
          type="button"
          onClick={onConfigure}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          Configure
        </button>
        <button
          type="button"
          disabled={test.isPending || !provider.secretsConfigured || provider.status === "TESTING"}
          onClick={() => test.mutate({ key: provider.key })}
          className="rounded-md border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          title="Test connection to provider"
        >
          <RefreshCw className={`w-3 h-3 ${test.isPending ? "animate-spin" : ""}`} />
          Test
        </button>
        {isDisabled ? (
          <button
            type="button"
            disabled={enable.isPending}
            onClick={() => enable.mutate(provider.key)}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3" /> Enable
          </button>
        ) : (
          <button
            type="button"
            disabled={disable.isPending}
            onClick={() => disable.mutate(provider.key)}
            className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Pause className="w-3 h-3" /> Disable
          </button>
        )}
        {provider.secretsConfigured > 0 && (
          <button
            type="button"
            disabled={reset.isPending}
            onClick={() => {
              if (confirm("Reset all credentials? This cannot be undone.")) {
                reset.mutate(provider.key);
              }
            }}
            className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
        {!isBuiltin && (
          <button
            type="button"
            disabled={deleteInteg.isPending}
            onClick={() => {
              if (confirm("Delete this integration? This cannot be undone.")) {
                deleteInteg.mutate(provider.key);
              }
            }}
            className="rounded-md border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="bg-muted/10 border-t border-border">
          {/* Error Message Panel */}
          {!provider.lastTestOk && provider.lastTestMessage && (
            <div className="px-4 pt-3">
              <ErrorMessagePanel message={provider.lastTestMessage} status={provider.status} />
            </div>
          )}

          {/* Connection Details Panel */}
          <ConnectionDetailsPanel
            details={health.data ?? null}
            history={history.data?.entries ?? []}
            loading={health.isLoading || history.isLoading}
          />
        </div>
      )}
    </div>
  );
}
