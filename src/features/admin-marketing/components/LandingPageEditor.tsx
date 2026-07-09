"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface LandingPageEditorProps {
  onCancel: () => void;
}

export function LandingPageEditor({ onCancel }: LandingPageEditorProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroImage, setHeroImage] = useState("");
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
          heroSection: {
            headline: heroHeadline,
            subheadline: heroSubheadline,
            backgroundImage: heroImage,
          },
          packages: [],
          faqSection: [],
        }),
      });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
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
      <h2 className="text-xl font-semibold mb-4">Create New Landing Page</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Page Title</label>
          <input
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dubai Summer Special"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL Slug</label>
          <input
            className="w-full bg-background border border-input rounded-md px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. dubai-summer-special (leave blank to auto-generate)"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="font-medium mb-3">Hero Section Builder</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Headline</label>
              <input
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                placeholder="Main Hero Text"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Subheadline</label>
              <input
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                placeholder="Supporting Hero Text"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Background Image URL</label>
              <input
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {isSaving ? "Publishing..." : "Publish Page"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="border border-input bg-background px-4 py-2 rounded-md font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
