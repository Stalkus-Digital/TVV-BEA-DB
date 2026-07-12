"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

interface Guide {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", slug: "", status: "DRAFT", body: "", excerpt: "", metaTitle: "", metaDescription: "", coverImage: "" });
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    try {
      setIsLoading(true);
      const res = await adminApiClient.get<{ items: Guide[] }>("/api/cms/guides");
      if (res && res.items) setGuides(res.items);
    } catch (err) {
      setError("Failed to fetch guides");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveGuide(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/guides/${form.id}`, form);
      } else {
        await adminApiClient.post("/api/cms/guides", form);
      }
      setIsEditing(false);
      fetchGuides();
    } catch (err) {
      alert("Failed to save guide");
    }
  }

  async function handleDelete() {
    if (!guideToDelete) return;
    try {
      await adminApiClient.delete(`/api/cms/guides/${guideToDelete}`);
      setGuideToDelete(null);
      fetchGuides();
    } catch (err) {
      alert("Failed to delete guide");
    }
  }

  return (
    <CmsPageShell
      title="Guides (Blogs)"
      description="Manage blog and guide articles."
      isLoading={isLoading}
      isError={!!error}
      errorMessage={error || undefined}
      onRefresh={fetchGuides}
      onRetry={fetchGuides}
    >
      <div className="flex justify-end mb-4">
        {!isEditing && (
          <button
            onClick={() => {
              setForm({ id: "", title: "", slug: "", status: "DRAFT", body: "", excerpt: "", metaTitle: "", metaDescription: "", coverImage: "" });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover"
          >
            + Create Guide
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveGuide} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Excerpt (short summary)</label>
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" placeholder="Brief description shown in listings..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Cover Image URL</label>
            <input type="url" value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Body / Content (Markdown supported)</label>
            <textarea rows={10} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" placeholder="Write your guide content here..." />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">SEO</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Meta Title</label>
                <input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Meta Description</label>
                <textarea rows={2} value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
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
              {guides.map(guide => (
                <tr key={guide.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{guide.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{guide.slug}</td>
                  <td className="px-4 py-3">{guide.status}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => { setForm({ id: guide.id, title: guide.title, slug: guide.slug, status: guide.status, body: (guide as any).body ?? "", excerpt: (guide as any).excerpt ?? "", metaTitle: (guide as any).metaTitle ?? "", metaDescription: (guide as any).metaDescription ?? "", coverImage: (guide as any).coverImage ?? "" }); setIsEditing(true); }} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => setGuideToDelete(guide.id)} className="text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {guides.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No guides found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {guideToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setGuideToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Guide</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this guide?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setGuideToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
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
