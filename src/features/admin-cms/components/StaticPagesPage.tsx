"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CmsPageShell } from "./CmsPageShell";
import { CmsEditorForm, EMPTY_EDITOR_FORM, slugify, type CmsEditorFormState } from "./CmsEditorForm";
import { adminApiClient } from "@/lib/admin-api/client";

const CUSTOM_PAGE_LINKS_KEY = "CUSTOM_PAGE_LINKS";

interface SitePageListItem {
  registryId: string;
  label: string;
  kind: "content" | "catalog";
  publicPath: string;
  description: string;
  slug: string | null;
  manageHref: string | null;
  id: string | null;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

interface PageContent {
  body?: string;
  excerpt?: string;
  heroEyebrow?: string;
  heroSubtitle?: string;
  heroImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface CmsPageDetail {
  id: string;
  title: string;
  slug: string;
  status: string;
  content?: PageContent | null;
}

interface CustomPageLinks {
  nav: { label: string; url: string }[];
  footer: { label: string; url: string; column: string }[];
}

function parseContent(content: CmsPageDetail["content"]): PageContent {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  return content as PageContent;
}

function normalizeCustomLinks(raw: unknown): CustomPageLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { nav: [], footer: [] };
  }
  const rec = raw as Record<string, unknown>;
  const nav = Array.isArray(rec.nav)
    ? rec.nav.filter(
        (x): x is { label: string; url: string } =>
          !!x && typeof x === "object" &&
          typeof (x as { label?: unknown }).label === "string" &&
          typeof (x as { url?: unknown }).url === "string",
      )
    : [];
  const footer = Array.isArray(rec.footer)
    ? rec.footer
        .filter(
          (x): x is { label: string; url: string; column: string } =>
            !!x && typeof x === "object" &&
            typeof (x as { label?: unknown }).label === "string" &&
            typeof (x as { url?: unknown }).url === "string",
        )
        .map((x) => ({
          label: x.label,
          url: x.url,
          column:
            typeof (x as { column?: unknown }).column === "string" && (x as { column: string }).column
              ? (x as { column: string }).column
              : "Company",
        }))
    : [];
  return { nav, footer };
}

export function StaticPagesPage() {
  const [pages, setPages] = useState<SitePageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CmsEditorFormState>(EMPTY_EDITOR_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkBusyId, setLinkBusyId] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => { void fetchPages(); }, []);

  async function fetchPages() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApiClient.get<{ items: SitePageListItem[] }>("/api/cms/pages");
      if (res?.items) setPages(res.items);
    } catch {
      setError("Failed to fetch pages");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_EDITOR_FORM);
    setFormError(null);
    setIsEditing(true);
  }

  async function openEdit(pageId: string, slugLocked: boolean) {
    try {
      setIsLoadingEdit(true);
      setFormError(null);
      const page = await adminApiClient.get<CmsPageDetail>(`/api/cms/pages/${pageId}`);
      if (!page) { setFormError("Page not found"); return; }
      const content = parseContent(page.content);
      setForm({
        ...EMPTY_EDITOR_FORM,
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        body: content.body ?? "",
        excerpt: content.excerpt ?? "",
        heroEyebrow: content.heroEyebrow ?? "",
        heroSubtitle: content.heroSubtitle ?? "",
        heroImage: typeof content.heroImage === "string" ? content.heroImage : "",
        metaTitle: content.metaTitle ?? "",
        metaDescription: content.metaDescription ?? "",
        slugLocked,
      });
      setIsEditing(true);
    } catch {
      setError("Failed to load page for editing");
    } finally {
      setIsLoadingEdit(false);
    }
  }

  async function savePage(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    const slug = form.slugLocked ? form.slug : slugify(form.slug.trim() || form.title);
    if (!slug) { setFormError("Slug is required"); return; }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      slug,
      status,
      content: {
        body: form.body,
        excerpt: form.excerpt,
        heroEyebrow: form.heroEyebrow.trim() || undefined,
        heroSubtitle: form.heroSubtitle.trim() || undefined,
        heroImage: form.heroImage.trim() || undefined,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      },
    };

    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/pages/${form.id}`, payload);
      } else {
        await adminApiClient.post("/api/cms/pages", payload);
      }
      setIsEditing(false);
      setForm(EMPTY_EDITOR_FORM);
      await fetchPages();
    } catch {
      setFormError("Failed to save page. Check that the slug is unique and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!pageToDelete) return;
    setIsDeleting(true);
    try {
      await adminApiClient.delete(`/api/cms/pages/${pageToDelete}`);
      setPageToDelete(null);
      await fetchPages();
    } catch {
      setError("Failed to delete page");
    } finally {
      setIsDeleting(false);
    }
  }

  async function loadCustomLinks(): Promise<CustomPageLinks> {
    const res = await adminApiClient.get<{ key: string; value: unknown }>(
      `/api/cms/config?key=${CUSTOM_PAGE_LINKS_KEY}`,
    );
    return normalizeCustomLinks(res?.value);
  }

  async function saveCustomLinks(next: CustomPageLinks) {
    await adminApiClient.put("/api/cms/config", { key: CUSTOM_PAGE_LINKS_KEY, value: next });
  }

  async function addToNav(item: SitePageListItem) {
    if (!item.id) return;
    setLinkBusyId(`${item.registryId}-nav`);
    try {
      const current = await loadCustomLinks();
      if (current.nav.some((l) => l.url === item.publicPath)) { alert("Already in navigation links."); return; }
      await saveCustomLinks({ ...current, nav: [...current.nav, { label: item.label, url: item.publicPath }] });
      alert(`Added "${item.label}" to navigation.`);
    } catch {
      alert("Failed to add to navigation.");
    } finally {
      setLinkBusyId(null);
    }
  }

  async function addToFooter(item: SitePageListItem) {
    if (!item.id) return;
    setLinkBusyId(`${item.registryId}-footer`);
    try {
      const current = await loadCustomLinks();
      if (current.footer.some((l) => l.url === item.publicPath)) { alert("Already in footer links."); return; }
      await saveCustomLinks({ ...current, footer: [...current.footer, { label: item.label, url: item.publicPath, column: "Company" }] });
      alert(`Added "${item.label}" to footer (Company).`);
    } catch {
      alert("Failed to add to footer.");
    } finally {
      setLinkBusyId(null);
    }
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      alert(`Public path: ${path}`);
    }
  }

  const isCustom = (item: SitePageListItem) => item.registryId.startsWith("custom-");

  return (
    <CmsPageShell
      title="Pages"
      description="All site pages you can edit. Content pages use the rich text editor; catalogs open their admin modules."
      isLoading={isLoading || isLoadingEdit}
      isError={!!error}
      errorMessage={error || undefined}
      onRefresh={fetchPages}
      onRetry={fetchPages}
    >
      <div className="flex justify-end mb-4">
        {!isEditing && (
          <button type="button" onClick={openCreate} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800">
            + Create custom page
          </button>
        )}
      </div>

      {isEditing ? (
        <CmsEditorForm
          form={form}
          onChange={setForm}
          isSaving={isSaving}
          formError={formError}
          showPageFields
          onCancel={() => { setIsEditing(false); setFormError(null); }}
          onSaveDraft={() => void savePage("DRAFT")}
          onPublish={() => void savePage("PUBLISHED")}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Page</th>
                <th className="text-left px-4 py-3 font-medium">Public URL</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((item) => {
                const isPublished = item.status === "PUBLISHED";
                const isCatalog = item.kind === "catalog";
                return (
                  <tr key={item.registryId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
                      {item.slug && <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.slug}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => void copyPath(item.publicPath)} className="font-mono text-[11px] text-primary hover:underline" title="Copy public path">
                        {copiedPath === item.publicPath ? "Copied!" : item.publicPath}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {isCatalog ? "Catalog" : "Content"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCatalog ? (
                        <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">Managed elsewhere</span>
                      ) : (
                        <span className={isPublished ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800" : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"}>
                          {isPublished ? "Published" : item.status || "Draft"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                        {isCatalog && item.manageHref ? (
                          <Link href={item.manageHref} className="text-primary hover:underline">Manage →</Link>
                        ) : null}
                        {!isCatalog && item.id ? (
                          <>
                            <button type="button" onClick={() => void openEdit(item.id!, !isCustom(item))} className="text-primary hover:underline">Edit</button>
                            {isPublished ? (
                              <>
                                <button type="button" disabled={linkBusyId === `${item.registryId}-nav`} onClick={() => void addToNav(item)} className="text-primary hover:underline disabled:opacity-50">Add to nav</button>
                                <button type="button" disabled={linkBusyId === `${item.registryId}-footer`} onClick={() => void addToFooter(item)} className="text-primary hover:underline disabled:opacity-50">Add to footer</button>
                              </>
                            ) : null}
                            {isCustom(item) ? (
                              <button type="button" onClick={() => setPageToDelete(item.id)} className="text-destructive hover:underline">Delete</button>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pages.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No pages returned from the API.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {pageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPageToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Page</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this custom page?</p>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={isDeleting} onClick={() => setPageToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
              <button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50">
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
