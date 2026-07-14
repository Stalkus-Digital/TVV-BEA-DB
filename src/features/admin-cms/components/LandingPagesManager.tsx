"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

export function LandingPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const defaultForm = {
    id: "", title: "", slug: "", 
    heroSection: { headline: "", subheadline: "", imageUrl: "" }, 
    packages: [], 
    faqSection: { faqs: [] },
    content: {
      valueProposition: [],
      inclusions: [],
      exclusions: [],
      timeline: [],
      whyBook: []
    }
  };

  const [form, setForm] = useState<any>(defaultForm);
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
          <button onClick={() => { setForm(defaultForm); setIsEditing(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
            + Create Landing Page
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {isEditing ? (
          <form onSubmit={savePage} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Slug</label>
                <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm">Hero Section</h4>
              <div>
                <label className="block text-xs font-medium mb-1">Headline</label>
                <input value={form.heroSection?.headline || ""} onChange={e => setForm({ ...form, heroSection: { ...form.heroSection, headline: e.target.value } })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Subheadline</label>
                <input value={form.heroSection?.subheadline || ""} onChange={e => setForm({ ...form, heroSection: { ...form.heroSection, subheadline: e.target.value } })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Image URL</label>
                <input value={form.heroSection?.imageUrl || ""} onChange={e => setForm({ ...form, heroSection: { ...form.heroSection, imageUrl: e.target.value } })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" placeholder="https://..." />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm">Packages to Feature</h4>
              <div>
                <label className="block text-xs font-medium mb-1">Package Slugs (comma separated)</label>
                <input value={form.packages?.join(", ") || ""} onChange={e => setForm({ ...form, packages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" placeholder="kerala-5n, andaman-honeymoon" />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm">FAQs</h4>
              <div>
                <label className="block text-xs font-medium mb-1">Raw JSON Data</label>
                <textarea 
                  rows={4}
                  value={JSON.stringify(form.faqSection, null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, faqSection: JSON.parse(e.target.value) });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm">Dynamic Sections Content</h4>
              <p className="text-xs text-muted-foreground">Provide JSON arrays for each section.</p>
              
              <div>
                <label className="block text-xs font-medium mb-1">Value Propositions (JSON Array)</label>
                <textarea 
                  rows={3}
                  value={JSON.stringify(form.content?.valueProposition || [], null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, content: { ...form.content, valueProposition: JSON.parse(e.target.value) } });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                  placeholder='[{"title":"...","description":"...","icon":"Clock"}]'
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Inclusions (JSON Array of strings)</label>
                <textarea 
                  rows={3}
                  value={JSON.stringify(form.content?.inclusions || [], null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, content: { ...form.content, inclusions: JSON.parse(e.target.value) } });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                  placeholder='["Breakfast", "Transfers"]'
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Exclusions (JSON Array of strings)</label>
                <textarea 
                  rows={3}
                  value={JSON.stringify(form.content?.exclusions || [], null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, content: { ...form.content, exclusions: JSON.parse(e.target.value) } });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                  placeholder='["Flights", "Lunch"]'
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Timeline Steps (JSON Array)</label>
                <textarea 
                  rows={3}
                  value={JSON.stringify(form.content?.timeline || [], null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, content: { ...form.content, timeline: JSON.parse(e.target.value) } });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                  placeholder='[{"day":1,"title":"Arrival","description":"..."}]'
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Why Book (JSON Array)</label>
                <textarea 
                  rows={3}
                  value={JSON.stringify(form.content?.whyBook || [], null, 2)} 
                  onChange={e => {
                    try {
                      setForm({ ...form, content: { ...form.content, whyBook: JSON.parse(e.target.value) } });
                    } catch (err) {}
                  }} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono" 
                  placeholder='[{"title":"...","description":"..."}]'
                />
              </div>
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
