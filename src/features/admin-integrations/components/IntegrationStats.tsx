"use client";

import { CheckCircle2, AlertCircle, Settings2, Eye } from "lucide-react";
import type { IntegrationProviderSummary } from "../types";

export function IntegrationStats({ integrations }: { integrations: IntegrationProviderSummary[] }) {
  const connected = integrations.filter((i) => i.status === "CONNECTED").length;
  const configured = integrations.filter((i) => i.status === "CONFIGURED").length;
  const failed = integrations.filter((i) => i.status === "FAILED").length;
  const notConfigured = integrations.filter((i) => i.status === "NOT_CONFIGURED").length;
  const disabled = integrations.filter((i) => i.status === "DISABLED").length;

  const total = integrations.length;
  const healthPercentage = total > 0 ? Math.round((connected / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
      <div className="rounded-lg border border-border bg-card p-3 text-center">
        <div className="text-2xl font-bold text-emerald-600">{connected}</div>
        <p className="text-xs text-muted-foreground mt-1">Connected</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center">
        <div className="text-2xl font-bold text-blue-600">{configured}</div>
        <p className="text-xs text-muted-foreground mt-1">Ready</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center">
        <div className="text-2xl font-bold text-red-600">{failed}</div>
        <p className="text-xs text-muted-foreground mt-1">Failed</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center">
        <div className="text-2xl font-bold text-slate-600">{notConfigured}</div>
        <p className="text-xs text-muted-foreground mt-1">Empty</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center">
        <div className="text-2xl font-bold text-slate-400">{disabled}</div>
        <p className="text-xs text-muted-foreground mt-1">Disabled</p>
      </div>
    </div>
  );
}
