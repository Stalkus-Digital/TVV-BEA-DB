"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  useIntegrationDetailQuery,
  useTestIntegrationMutation,
  useUpdateIntegrationMutation,
} from "../hooks/useIntegrationsQueries";

interface ProviderConfigureDrawerProps {
  providerKey: string | null;
  onClose: () => void;
}

export function ProviderConfigureDrawer({ providerKey, onClose }: ProviderConfigureDrawerProps) {
  const detailQuery = useIntegrationDetailQuery(providerKey);
  const updateMutation = useUpdateIntegrationMutation();
  const testMutation = useTestIntegrationMutation();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!detailQuery.data) return;
    const next: Record<string, string> = {};
    for (const field of detailQuery.data.fields) {
      if (field.secret) continue;
      const fromPublic = detailQuery.data.publicConfig[field.key];
      if (fromPublic !== undefined && fromPublic !== null) next[field.key] = String(fromPublic);
    }
    setConfig(next);
    setSecrets({});
    setMessage(null);
  }, [detailQuery.data]);

  if (!providerKey) return null;

  const detail = detailQuery.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md h-full bg-white border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{detail?.name ?? "Configure"}</h2>
            <p className="text-xs text-muted-foreground font-mono">{providerKey}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {detailQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {detailQuery.isError && (
            <p className="text-sm text-red-600">
              {detailQuery.error instanceof Error ? detailQuery.error.message : "Failed to load"}
            </p>
          )}

          {detail && (
            <>
              <p className="text-sm text-muted-foreground">{detail.description}</p>

              {detail.fields.map((field) => {
                const secretMeta = detail.secretFields.find((s) => s.fieldKey === field.key);
                if (field.kind === "boolean") {
                  const checked = config[field.key] === "true" || config[field.key] === "1";
                  return (
                    <label key={field.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setConfig((c) => ({ ...c, [field.key]: e.target.checked ? "true" : "false" }))
                        }
                      />
                      {field.label}
                    </label>
                  );
                }

                if (field.secret) {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-medium" htmlFor={field.key}>
                        {field.label}
                        {field.required ? " *" : ""}
                      </label>
                      <input
                        id={field.key}
                        type="password"
                        autoComplete="new-password"
                        placeholder={
                          secretMeta?.configured
                            ? `Configured (…${secretMeta.lastFour ?? "****"}) — leave blank to keep`
                            : field.placeholder ?? "Enter secret"
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={secrets[field.key] ?? ""}
                        onChange={(e) => setSecrets((s) => ({ ...s, [field.key]: e.target.value }))}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-medium" htmlFor={field.key}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>
                    <input
                      id={field.key}
                      type={field.kind === "url" ? "url" : "text"}
                      placeholder={field.placeholder}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={config[field.key] ?? ""}
                      onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    />
                  </div>
                );
              })}

              {detail.webhooks.length > 0 && (
                <div className="rounded-md border border-dashed border-border p-3 space-y-1">
                  <p className="text-xs font-semibold">Webhook URLs</p>
                  {detail.webhooks.map((wh) => (
                    <p key={wh.id} className="font-mono text-[11px] text-muted-foreground">
                      {wh.path}
                    </p>
                  ))}
                </div>
              )}

              {message && <p className="text-xs text-teal-700">{message}</p>}
              {updateMutation.isError && (
                <p className="text-xs text-red-600">
                  {updateMutation.error instanceof Error ? updateMutation.error.message : "Save failed"}
                </p>
              )}
              {testMutation.data && (
                <p className={`text-xs ${testMutation.data.ok ? "text-emerald-700" : "text-red-600"}`}>
                  {testMutation.data.message}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    const secretPayload: Record<string, string> = {};
                    for (const [k, v] of Object.entries(secrets)) {
                      if (v.trim()) secretPayload[k] = v.trim();
                    }
                    updateMutation.mutate(
                      { key: providerKey, body: { config, secrets: secretPayload } },
                      { onSuccess: () => setMessage("Saved.") }
                    );
                  }}
                  className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  disabled={testMutation.isPending}
                  onClick={() => testMutation.mutate(providerKey)}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {testMutation.isPending ? "Testing…" : "Test connection"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
