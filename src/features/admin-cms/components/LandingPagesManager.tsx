"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

export function LandingPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", slug: "", heroSection: {}, packages: [], faqSection: {} });
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setIsLoading(true);
    try {
      const res = await adminApiClient.get<{ items: any[] }>("/api/cms/landing-pages");
      if (res && res.items) setPages(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/landing-pages/${form.id}`, form);
      } else {
        await adminApiClient.post("/api/cms/landing-pages", form);
      }
      setIsEditing(false);
      fetchPages();
    } catch (err) {
      alert("Failed to save landing page");
    }
  }

  async function handleDelete() {
    if (!pageToDelete) return;
    try {
      await adminApiClient.delete(`/api/cms/landing-pages/${pageToDelete}`);
      setPageToDelete(null);
      fetchPages();
    } catch (err) {
      alert("Failed to delete landing page");
    }
  }

  return (
    <CmsPageShell title="Landing Pages Builder" description="Create and manage dynamic SEO destination landing pages.">
      <div className="mt-6 flex justify-end">
        {!isEditing && (
          <button onClick={() => { setForm({ id: "", title: "", slug: "", heroSection: {}, packages: [], faqSection: {} }); setIsEditing(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
            + Create Landing Page
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
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
            {/* Extended builder inputs (hero, packages, faqs) go here — simplified for MVP */}
            <div className="p-4 bg-muted text-xs rounded border border-border">
              <p>Use the visual block builder to construct the landing page layout.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover">Save</button>
            </div>
          </form>
        ) : isLoading ? (
          <p>Loading pages...</p>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
            No landing pages created yet.
          </div>
        ) : (
          pages.map(page => (
            <div key={page.id} className="p-4 border border-border bg-card rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{page.title}</h3>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted text-emerald-600" onClick={() => window.open(`/api/admin/landing-pages/${page.id}/export?format=html`, '_blank')}>Export HTML</button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted text-emerald-600" onClick={() => window.open(`/api/admin/landing-pages/${page.id}/export?format=php`, '_blank')}>Export PHP</button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted ml-4" onClick={() => { setForm(page); setIsEditing(true); }}>Edit</button>
                <button className="px-3 py-1 text-sm border rounded text-destructive hover:bg-destructive/10" onClick={() => setPageToDelete(page.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {pageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPageToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Landing Page</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this landing page?</p>
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
