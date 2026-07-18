"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUpdateCmsConfigMutation, useUpdateFeaturedMutation } from "../hooks/useCmsMutations";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import {
  createLocalSection,
  ensureSections,
  HOME_SECTION_TYPES,
  SECTION_TYPE_META,
  sectionLabel,
  type HomeSectionType,
} from "../section-meta";
import type { HomeSection } from "../types";
import { formatDate } from "../utils";
import { CmsPageShell } from "./CmsPageShell";
import { SectionDataEditor } from "./SectionDataEditor";

export function HomeSectionsPage() {
  const cms = useCmsContentQuery();
  const featuredMutation = useUpdateFeaturedMutation();
  const configMutation = useUpdateCmsConfigMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [quickLinks, setQuickLinks] = useState<{ label: string; url: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addType, setAddType] = useState<HomeSectionType>("hero");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!cms.home || hydrated) return;
    setSections(ensureSections(cms.home.sections));
    setQuickLinks(cms.home.quickLinks ?? []);
    setHydrated(true);
  }, [cms.home, hydrated]);

  async function toggleFeatured(id: string, current: boolean) {
    setError(null);
    try {
      await featuredMutation.mutateAsync({ id, isFeatured: !current });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured status");
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  function updateSection(id: string, patch: Partial<HomeSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSection(id: string) {
    if (!confirm("Remove this section from the homepage?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function addSection() {
    const section = createLocalSection(addType);
    setSections((prev) => [...prev, section]);
    setEditingId(section.id);
  }

  async function saveHomepage() {
    setError(null);
    setSuccess(null);
    try {
      const hero = sections.find((s) => s.type === "hero" && s.enabled);
      const images = hero && Array.isArray(hero.data.images) ? (hero.data.images as string[]) : [];
      const heroBanner = hero
        ? {
            headline: String(hero.data.headline ?? ""),
            subheadline: String(hero.data.subheadline ?? ""),
            backgroundImage: images[0] ?? null,
            ctaLabel: "Explore Packages",
            ctaUrl: "/packages",
          }
        : cms.home?.heroBanner;

      await configMutation.mutateAsync({
        key: "HOME_SECTIONS",
        value: {
          sections,
          quickLinks: quickLinks.filter((l) => l.label && l.url),
          heroBanner,
        },
      });
      setSuccess("Homepage sections saved.");
      setHydrated(false);
      await cms.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save homepage sections");
    }
  }

  return (
    <CmsPageShell
      title="Home Page Sections"
      description="Compose the homepage: add, remove, reorder, enable, and edit section content."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => {
        setHydrated(false);
        void cms.refetch();
      }}
      onRetry={() => {
        setHydrated(false);
        void cms.refetch();
      }}
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Sections</h2>
        <button
          type="button"
          disabled={configMutation.isPending || sections.length === 0}
          onClick={() => void saveHomepage()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {configMutation.isPending ? "Saving…" : "Save homepage"}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium">Add section</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={addType}
            onChange={(e) => setAddType(e.target.value as HomeSectionType)}
          >
            {HOME_SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {SECTION_TYPE_META[type].label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addSection}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Add section
        </button>
      </div>

      <ul className="space-y-3">
        {sections.map((section, index) => {
          const meta = SECTION_TYPE_META[section.type as HomeSectionType];
          const isEditing = editingId === section.id;
          return (
            <li key={section.id} className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{sectionLabel(section.type)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {meta?.description ?? section.type}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                    className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : section.id)}
                    className="rounded border border-border px-2 py-1 text-xs"
                  >
                    {isEditing ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="rounded border border-destructive/40 px-2 py-1 text-xs text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {isEditing && (
                <div className="border-t border-border px-4 py-4">
                  <SectionDataEditor
                    type={section.type}
                    data={section.data ?? {}}
                    onChange={(data) => updateSection(section.id, { data })}
                  />
                </div>
              )}
            </li>
          );
        })}
        {sections.length === 0 && (
          <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No sections yet. Add one above, then save.
          </li>
        )}
      </ul>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <p className="text-sm text-muted-foreground">Optional nav quick links stored with homepage config.</p>
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          {quickLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const next = [...quickLinks];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setQuickLinks(next);
                }}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                placeholder="URL"
                value={link.url}
                onChange={(e) => {
                  const next = [...quickLinks];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setQuickLinks(next);
                }}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== idx))}
                className="rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuickLinks([...quickLinks, { label: "", url: "" }])}
            className="text-sm text-slate-900 hover:underline"
          >
            + Add link
          </button>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured destinations</h2>
        <p className="text-sm text-muted-foreground">
          Toggle which destinations appear in destination shelves on the homepage.
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
                    <Link href={`/destinations?selected=${destination.id}`} className="text-slate-900 hover:underline">
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
                      className="text-xs font-medium text-slate-900 hover:underline disabled:opacity-50"
                    >
                      {destination.isFeatured ? "Remove featured" : "Mark featured"}
                    </button>
                  </td>
                </tr>
              ))}
              {cms.destinations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No destinations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured packages (read-only)</h2>
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
                    <Link href={`/packages?selected=${pkg.id}`} className="text-slate-900 hover:underline">
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
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No published packages on homepage
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </CmsPageShell>
  );
}
