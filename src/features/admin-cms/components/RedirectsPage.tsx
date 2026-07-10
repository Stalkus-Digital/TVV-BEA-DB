"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

interface Redirect {
  id: string;
  source: string;
  target: string;
  isPermanent: boolean;
  createdAt: string;
}

export function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: "", source: "", target: "", isPermanent: true });
  const [redirectToDelete, setRedirectToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRedirects();
  }, []);

  async function fetchRedirects() {
    try {
      setIsLoading(true);
      const res = await adminApiClient.get<{ items: Redirect[] }>("/api/cms/redirects");
      if (res && res.items) setRedirects(res.items);
    } catch (err) {
      setError("Failed to fetch redirects");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveRedirect(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/redirects/${form.id}`, form);
      } else {
        await adminApiClient.post("/api/cms/redirects", form);
      }
      setIsEditing(false);
      fetchRedirects();
    } catch (err) {
      alert("Failed to save redirect");
    }
  }

  async function handleDelete() {
    if (!redirectToDelete) return;
    try {
      await adminApiClient.delete(`/api/cms/redirects/${redirectToDelete}`);
      setRedirectToDelete(null);
      fetchRedirects();
    } catch (err) {
      alert("Failed to delete redirect");
    }
  }

  return (
    <CmsPageShell
      title="Redirect Management"
      description="Manage 301 and 302 URL redirects."
      isLoading={isLoading}
      isError={!!error}
      errorMessage={error || undefined}
      onRefresh={fetchRedirects}
      onRetry={fetchRedirects}
    >
      <div className="flex justify-end mb-4">
        {!isEditing && (
          <button
            onClick={() => {
              setForm({ id: "", source: "", target: "", isPermanent: true });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover"
          >
            + Create Redirect
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveRedirect} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Source URL</label>
            <input required placeholder="/old-path" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Target URL</label>
            <input required placeholder="/new-path" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.isPermanent} onChange={e => setForm({ ...form, isPermanent: e.target.checked })} />
              Permanent (301)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover">Save</button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Target</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map(redirect => (
                <tr key={redirect.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{redirect.source}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{redirect.target}</td>
                  <td className="px-4 py-3">{redirect.isPermanent ? "301 (Permanent)" : "302 (Temporary)"}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => { setForm({ id: redirect.id, source: redirect.source, target: redirect.target, isPermanent: redirect.isPermanent }); setIsEditing(true); }} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => setRedirectToDelete(redirect.id)} className="text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No redirects found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {redirectToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRedirectToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Redirect</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this redirect?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRedirectToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
