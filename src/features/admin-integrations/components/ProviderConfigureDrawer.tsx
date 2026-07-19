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

function buildSecretPayload(secrets: Record<string, string>): Record<string, string> {
  const secretPayload: Record<string, string> = {};
  for (const [k, v] of Object.entries(secrets)) {
    if (v.trim()) secretPayload[k] = v.trim();
  }
  return secretPayload;
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
  const busy = updateMutation.isPending || testMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{detail?.name ?? "Configure"}</h2>
            <p className="font-mono text-xs text-muted-foreground">{providerKey}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {detailQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {detailQuery.isError && (
            <p className="text-sm text-red-600">
              {detailQuery.error instanceof Error ? detailQuery.error.message : "Failed to load"}
            </p>
          )}

          {detail && (
            <>
              <p className="text-sm text-muted-foreground">{detail.description}</p>
              <ol className="list-decimal space-y-1 rounded-md bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                <li>
                  Paste your credentials below, then click <span className="font-semibold text-foreground">Save API key</span>.
                </li>
                <li>
                  Click <span className="font-semibold text-foreground">Test connection</span> to verify with the provider.
                </li>
              </ol>

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
                            ? `Configured (…${secretMeta.lastFour ?? "****"}) — paste a new key to replace`
                            : field.placeholder ?? "Enter secret"
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={secrets[field.key] ?? ""}
                        onChange={(e) => setSecrets((s) => ({ ...s, [field.key]: e.target.value }))}
                      />
                      {providerKey === "openai" && field.key === "apiKey" && (
                        <p className="text-[11px] text-muted-foreground">
                          Use an OpenAI key from{" "}
                          <span className="font-medium">platform.openai.com</span> starting with{" "}
                          <span className="font-mono">sk-</span>. Google AI Studio / Gemini keys will not work.
                        </p>
                      )}
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
                <div className="space-y-1 rounded-md border border-dashed border-border p-3">
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
              {testMutation.isError && (
                <p className="text-xs text-red-600">
                  {testMutation.error instanceof Error ? testMutation.error.message : "Test failed"}
                </p>
              )}
              {testMutation.data && (
                <p className={`text-xs ${testMutation.data.ok ? "text-emerald-700" : "text-red-600"}`}>
                  {testMutation.data.message}
                </p>
              )}
            </>
          )}
        </div>

        {detail && (
          <div className="shrink-0 space-y-2 border-t border-border bg-card px-6 py-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const secretPayload = buildSecretPayload(secrets);
                if (providerKey === "openai" && !secretPayload.apiKey && !detail.secretFields.some((s) => s.configured)) {
                  setMessage(null);
                  updateMutation.reset();
                  setMessage("Paste an OpenAI API key before saving.");
                  return;
                }
                updateMutation.mutate(
                  { key: providerKey, body: { config, secrets: secretPayload } },
                  {
                    onSuccess: () => {
                      setSecrets({});
                      setMessage("API key saved. Now click Test connection.");
                    },
                  }
                );
              }}
              className="w-full rounded-md bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving…" : "Save API key"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMessage(null);
                // Test only the key already saved in the vault — Save first if you typed a new one
                testMutation.mutate(
                  { key: providerKey, body: {} },
                  {
                    onSuccess: (result) => {
                      setMessage(result.ok ? "Connection OK — OpenAI is connected." : null);
                    },
                  }
                );
              }}
              className="w-full rounded-md border-2 border-slate-900 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              {testMutation.isPending ? "Testing…" : "Test connection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
