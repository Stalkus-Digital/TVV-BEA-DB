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
  const [form, setForm] = useState({ id: "", title: "", slug: "", status: "DRAFT" });

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

  async function deleteGuide(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await adminApiClient.delete(`/api/cms/guides/${id}`);
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
              setForm({ id: "", title: "", slug: "", status: "DRAFT" });
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
                    <button onClick={() => { setForm({ id: guide.id, title: guide.title, slug: guide.slug, status: guide.status }); setIsEditing(true); }} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => deleteGuide(guide.id)} className="text-destructive hover:underline">Delete</button>
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
    </CmsPageShell>
  );
}
