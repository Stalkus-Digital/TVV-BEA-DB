"use client";

import Link from "next/link";
import { useState } from "react";
import { BACKEND_GAPS } from "../constants";
import { useUpdateCmsConfigMutation, useUpdateFeaturedMutation } from "../hooks/useCmsMutations";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import { formatDate } from "../utils";
import { CmsPageShell } from "./CmsPageShell";

export function HomeSectionsPage() {
  const cms = useCmsContentQuery();
  const featuredMutation = useUpdateFeaturedMutation();
  const configMutation = useUpdateCmsConfigMutation();
  const [error, setError] = useState<string | null>(null);

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({ headline: "", subheadline: "", ctaLabel: "", ctaUrl: "", backgroundImage: "" });

  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [linksForm, setLinksForm] = useState<{ label: string; url: string }[]>([]);

  async function toggleFeatured(id: string, current: boolean) {
    setError(null);
    try {
      await featuredMutation.mutateAsync({ id, isFeatured: !current });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured status");
    }
  }

  async function saveHeroBanner(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const currentConfig = { heroBanner: cms.home?.heroBanner, quickLinks: cms.home?.quickLinks };
      await configMutation.mutateAsync({
        key: "HOME_SECTIONS",
        value: { ...currentConfig, heroBanner: { ...heroForm, backgroundImage: heroForm.backgroundImage || null } }
      });
      setIsEditingHero(false);
    } catch (err) {
      setError("Failed to save hero banner");
    }
  }

  async function saveQuickLinks(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const currentConfig = { heroBanner: cms.home?.heroBanner, quickLinks: cms.home?.quickLinks };
      await configMutation.mutateAsync({
        key: "HOME_SECTIONS",
        value: { ...currentConfig, quickLinks: linksForm.filter(l => l.label && l.url) }
      });
      setIsEditingLinks(false);
    } catch (err) {
      setError("Failed to save quick links");
    }
  }

  return (
    <CmsPageShell
      title="Home Page Sections"
      description="Manage the hero banner, featured destinations, and quick links on the homepage."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => void cms.refetch()}
      onRetry={() => void cms.refetch()}
    >
      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hero banner</h2>
          {!isEditingHero && (
            <button
              onClick={() => {
                setHeroForm({
                  headline: cms.home?.heroBanner?.headline || "",
                  subheadline: cms.home?.heroBanner?.subheadline || "",
                  ctaLabel: cms.home?.heroBanner?.ctaLabel || "",
                  ctaUrl: cms.home?.heroBanner?.ctaUrl || "",
                  backgroundImage: cms.home?.heroBanner?.backgroundImage || "",
                });
                setIsEditingHero(true);
              }}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingHero ? (
          <form onSubmit={saveHeroBanner} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Headline</label>
              <input required value={heroForm.headline} onChange={e => setHeroForm(f => ({ ...f, headline: e.target.value }))} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Subheadline</label>
              <input required value={heroForm.subheadline} onChange={e => setHeroForm(f => ({ ...f, subheadline: e.target.value }))} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">CTA Label</label>
                <input required value={heroForm.ctaLabel} onChange={e => setHeroForm(f => ({ ...f, ctaLabel: e.target.value }))} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">CTA URL</label>
                <input required value={heroForm.ctaUrl} onChange={e => setHeroForm(f => ({ ...f, ctaUrl: e.target.value }))} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Background Image URL (optional)</label>
              <input value={heroForm.backgroundImage} onChange={e => setHeroForm(f => ({ ...f, backgroundImage: e.target.value }))} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditingHero(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
              <button type="submit" disabled={configMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover">Save</button>
            </div>
          </form>
        ) : (
          cms.home?.heroBanner && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-2 text-sm">
              <p><span className="text-muted-foreground">Headline:</span> {cms.home.heroBanner.headline}</p>
              <p><span className="text-muted-foreground">Subheadline:</span> {cms.home.heroBanner.subheadline}</p>
              <p><span className="text-muted-foreground">CTA:</span> {cms.home.heroBanner.ctaLabel} → {cms.home.heroBanner.ctaUrl}</p>
              <p><span className="text-muted-foreground">Background:</span> {cms.home.heroBanner.backgroundImage ?? "—"}</p>
            </div>
          )
        )}
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured packages</h2>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">From price</th>
              </tr>
            </thead>
            <tbody>
              {(cms.home?.featuredPackages ?? []).map((pkg) => (
                <tr key={pkg.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/packages?selected=${pkg.id}`} className="text-primary hover:underline">
                      {pkg.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{pkg.destinationName || "—"}</td>
                  <td className="px-4 py-3">
                    {pkg.fromPrice != null ? `${pkg.currency} ${pkg.fromPrice.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
              {(cms.home?.featuredPackages.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No published packages on homepage</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured destinations</h2>
        <p className="text-sm text-muted-foreground">
          Toggle which destinations appear in the featured section on the homepage.
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Featured</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {cms.destinations.map((destination) => (
                <tr key={destination.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/destinations?selected=${destination.id}`} className="text-primary hover:underline">
                      {destination.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{destination.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(destination.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={featuredMutation.isPending}
                      onClick={() => void toggleFeatured(destination.id, destination.isFeatured)}
                      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {destination.isFeatured ? "Remove featured" : "Mark featured"}
                    </button>
                  </td>
                </tr>
              ))}
              {cms.destinations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No destinations</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick links</h2>
          {!isEditingLinks && (
            <button
              onClick={() => {
                setLinksForm(cms.home?.quickLinks ?? []);
                setIsEditingLinks(true);
              }}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingLinks ? (
          <form onSubmit={saveQuickLinks} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            {linksForm.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input required placeholder="Label" value={link.label} onChange={e => { const newLinks = [...linksForm]; newLinks[idx].label = e.target.value; setLinksForm(newLinks); }} className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm" />
                <input required placeholder="URL" value={link.url} onChange={e => { const newLinks = [...linksForm]; newLinks[idx].url = e.target.value; setLinksForm(newLinks); }} className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm" />
                <button type="button" onClick={() => setLinksForm(linksForm.filter((_, i) => i !== idx))} className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm">X</button>
              </div>
            ))}
            <button type="button" onClick={() => setLinksForm([...linksForm, { label: "", url: "" }])} className="text-sm text-primary hover:underline">+ Add Link</button>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditingLinks(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
              <button type="submit" disabled={configMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover">Save</button>
            </div>
          </form>
        ) : (
          <ul className="rounded-xl border border-border bg-card divide-y divide-border">
            {(cms.home?.quickLinks ?? []).map((link) => (
              <li key={link.url} className="px-4 py-3 text-sm flex justify-between">
                <span>{link.label}</span>
                <span className="text-muted-foreground font-mono text-xs">{link.url}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CmsPageShell>
  );
}
