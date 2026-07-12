"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

export function StaticPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", slug: "", status: "DRAFT" });
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      setIsLoading(true);
      const res = await adminApiClient.get<{ items: StaticPage[] }>("/api/cms/pages");
      if (res && res.items) setPages(res.items);
    } catch (err) {
      setError("Failed to fetch static pages");
    } finally {
      setIsLoading(false);
    }
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/pages/${form.id}`, form);
      } else {
        await adminApiClient.post("/api/cms/pages", form);
      }
      setIsEditing(false);
      fetchPages();
    } catch (err) {
      alert("Failed to save static page");
    }
  }

  async function handleDelete() {
    if (!pageToDelete) return;
    try {
      await adminApiClient.delete(`/api/cms/pages/${pageToDelete}`);
      setPageToDelete(null);
      fetchPages();
    } catch (err) {
      alert("Failed to delete page");
    }
  }

  return (
    <CmsPageShell
      title="Static Pages"
      description="Manage static page content like About Us, Contact Us, etc."
      isLoading={isLoading}
      isError={!!error}
      errorMessage={error || undefined}
      onRefresh={fetchPages}
      onRetry={fetchPages}
    >
      <div className="flex justify-end mb-4">
        {!isEditing && (
          <button
            onClick={() => {
              setForm({ id: "", title: "", slug: "", status: "DRAFT" });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover"
          >
            + Create Page
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={savePage} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
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
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{page.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{page.slug}</td>
                  <td className="px-4 py-3">{page.status}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => { setForm({ id: page.id, title: page.title, slug: page.slug, status: page.status }); setIsEditing(true); }} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => setPageToDelete(page.id)} className="text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No static pages found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPageToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Static Page</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this page?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPageToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
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
