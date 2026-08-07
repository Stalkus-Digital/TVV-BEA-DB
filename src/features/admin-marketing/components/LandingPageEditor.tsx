"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDestinationsQuery } from "@/features/admin-destinations/hooks/useDestinationsQuery";

interface LandingPageEditorProps {
  onCancel: () => void;
}

export function LandingPageEditor({ onCancel }: LandingPageEditorProps) {
  const queryClient = useQueryClient();
  const destinationsQuery = useDestinationsQuery({});
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          destinationId: destinationId || null,
          template: "destination_v1",
          status,
          seoTitle,
          seoDescription,
        }),
      });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "landingPages"] });
        onCancel();
      } else {
        alert("Failed to save landing page");
      }
    } catch (error) {
      alert("Error saving landing page");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Destination Landing Page Editor</h2>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title (Internal)</label>
            <input required className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kerala SEO Landing Page" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <input required className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. kerala" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Linked Destination</label>
            <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
              <option value="">-- None --</option>
              {destinationsQuery.data?.items?.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">SEO Title</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Meta Title for Google" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">SEO Description</label>
            <textarea rows={3} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta Description for Google" />
          </div>
        </div>

        <div className="pt-6 flex gap-3 border-t border-border">
          <button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Landing Page"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSaving} className="border border-input bg-background px-6 py-2 rounded-md font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
