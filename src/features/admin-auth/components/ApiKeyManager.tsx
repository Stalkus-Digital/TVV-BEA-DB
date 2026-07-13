"use client";

import { useState } from "react";
import { KeySquare, Plus, Trash2 } from "lucide-react";
import { useApiKeysQuery, useRevokeApiKey } from "../hooks/useApiKeys";
import { ApiKeyCreateDialog } from "./ApiKeyCreateDialog";

export function ApiKeyManager() {
  const { data: keys, isLoading, isError, refetch } = useApiKeysQuery();
  const revokeMutation = useRevokeApiKey();
  const [createOpen, setCreateOpen] = useState(false);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? Any application using it will immediately lose access.")) return;
    try {
      await revokeMutation.mutateAsync(id);
    } catch (e: any) {
      alert("Failed to revoke: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage programmatic access to your Admin APIs.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Generate Key
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading keys...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            <p>Failed to load API keys.</p>
            <button onClick={() => refetch()} className="mt-4 underline">Retry</button>
          </div>
        ) : !keys?.length ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <KeySquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No API Keys</h3>
            <p className="text-sm mt-1 max-w-sm">Generate your first API key to connect external applications to your platform.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-6 border border-border hover:bg-muted px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Generate Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Prefix</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {key.keyPrefix}••••••••
                    </td>
                    <td className="px-6 py-4">
                      {key.isActive ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">Revoked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        disabled={!key.isActive || revokeMutation.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApiKeyCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
