"use client";

import { useEffect, useState } from "react";
import { useUpdateCmsConfigMutation } from "../hooks/useCmsMutations";
import { useWebsiteNavigationQuery } from "../hooks/useCmsQueries";
import { CmsPageShell } from "./CmsPageShell";
import { adminApiClient } from "@/lib/admin-api/client";

interface PublishedPage {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export function NavigationPage() {
  const navigationQuery = useWebsiteNavigationQuery();
  const configMutation = useUpdateCmsConfigMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [menuForm, setMenuForm] = useState<{ label: string; url: string }[]>([]);
  const [publishedPages, setPublishedPages] = useState<PublishedPage[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminApiClient.get<{ items: PublishedPage[] }>("/api/cms/pages");
        setPublishedPages((res?.items ?? []).filter((p) => p.status === "PUBLISHED"));
      } catch {
        setPublishedPages([]);
      }
    })();
  }, []);

  async function saveMenu(e: React.FormEvent) {
    e.preventDefault();
    try {
      await configMutation.mutateAsync({
        key: "NAVIGATION",
        value: menuForm.filter((m) => m.label && m.url),
      });
      setIsEditing(false);
    } catch {
      alert("Failed to save navigation menu");
    }
  }

  function insertCmsPage(slug: string) {
    const page = publishedPages.find((p) => p.slug === slug);
    if (!page) return;
    setMenuForm((prev) => [...prev, { label: page.title, url: `/p/${page.slug}` }]);
  }

  return (
    <CmsPageShell
      title="Navigation Menus"
      description="Manage the main navigation menus for the public website."
      isLoading={navigationQuery.isLoading}
      isError={navigationQuery.isError}
      errorMessage={navigationQuery.error instanceof Error ? navigationQuery.error.message : undefined}
      isRefreshing={navigationQuery.isFetching}
      onRefresh={() => void navigationQuery.refetch()}
      onRetry={() => void navigationQuery.refetch()}
      isEmpty={!navigationQuery.isLoading && !navigationQuery.isError && (navigationQuery.data?.menu.length ?? 0) === 0}
      emptyMessage="No menu items returned"
    >
      <div className="flex items-center justify-between mt-6 mb-4">
        <h2 className="text-lg font-semibold">Top Navigation</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setMenuForm(navigationQuery.data?.menu?.map((m) => ({ label: m.label, url: m.url })) ?? []);
              setIsEditing(true);
            }}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveMenu} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          {publishedPages.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2">
              <label className="text-xs font-medium text-muted-foreground">Insert CMS page</label>
              <select
                className="bg-background border border-input rounded-md px-2 py-1.5 text-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    insertCmsPage(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Choose a page…</option>
                {publishedPages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title} (/p/{p.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {menuForm.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                required
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const newMenu = [...menuForm];
                  newMenu[idx].label = e.target.value;
                  setMenuForm(newMenu);
                }}
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="URL"
                value={item.url}
                onChange={(e) => {
                  const newMenu = [...menuForm];
                  newMenu[idx].url = e.target.value;
                  setMenuForm(newMenu);
                }}
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setMenuForm(menuForm.filter((_, i) => i !== idx))}
                className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMenuForm([...menuForm, { label: "", url: "" }])}
            className="text-sm text-primary hover:underline"
          >
            + Add Menu Item
          </button>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={configMutation.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {(navigationQuery.data?.menu ?? []).map((item) => (
            <div key={item.url} className="px-4 py-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{item.url}</span>
              </div>
              {item.children && item.children.length > 0 && (
                <ul className="mt-2 ml-4 space-y-1 border-l border-border pl-3">
                  {item.children.map((child) => (
                    <li key={child.url} className="flex justify-between text-xs text-muted-foreground">
                      <span>{child.label}</span>
                      <span className="font-mono">{child.url}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {(navigationQuery.data?.customNavLinks?.length ?? 0) > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">CMS page links (header)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Added from Pages → Add to nav. These appear as top-level header links on the marketing site.
          </p>
          <ul className="rounded-xl border border-border bg-card divide-y divide-border">
            {(navigationQuery.data?.customNavLinks ?? []).map((link) => (
              <li key={link.url} className="px-4 py-3 text-sm flex justify-between">
                <span>{link.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{link.url}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Popular destinations (dynamic)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These are resolved from the Destination Engine at request time — not editable here.
        </p>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {(navigationQuery.data?.popularDestinations ?? []).map((dest) => (
            <li key={dest.slug} className="px-4 py-3 text-sm flex justify-between">
              <span>{dest.name}</span>
              <span className="font-mono text-xs text-muted-foreground">/{dest.slug}</span>
            </li>
          ))}
        </ul>
      </section>
    </CmsPageShell>
  );
}
