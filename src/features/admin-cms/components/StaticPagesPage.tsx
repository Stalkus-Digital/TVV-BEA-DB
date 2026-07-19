"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CmsPageShell } from "./CmsPageShell";
import { CmsRichTextEditor } from "./CmsRichTextEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { adminApiClient } from "@/lib/admin-api/client";
import { uploadFile } from "@/lib/admin-api/upload";

const CUSTOM_PAGE_LINKS_KEY = "CUSTOM_PAGE_LINKS";

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
  createdAt: string;
  content?: PageContent | null;
}

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

interface PageFormState {
  id: string;
  title: string;
  slug: string;
  status: string;
  body: string;
  excerpt: string;
  heroEyebrow: string;
  heroSubtitle: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
  slugLocked: boolean;
}

interface CustomPageLinks {
  nav: { label: string; url: string }[];
  footer: { label: string; url: string; column: string }[];
}

const EMPTY_FORM: PageFormState = {
  id: "",
  title: "",
  slug: "",
  status: "DRAFT",
  body: "",
  excerpt: "",
  heroEyebrow: "",
  heroSubtitle: "",
  heroImage: "",
  metaTitle: "",
  metaDescription: "",
  slugLocked: false,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
          !!x &&
          typeof x === "object" &&
          typeof (x as { label?: unknown }).label === "string" &&
          typeof (x as { url?: unknown }).url === "string",
      )
    : [];
  const footer = Array.isArray(rec.footer)
    ? rec.footer
        .filter(
          (x): x is { label: string; url: string; column: string } =>
            !!x &&
            typeof x === "object" &&
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
  const [form, setForm] = useState<PageFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkBusyId, setLinkBusyId] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const slugTouchedRef = useRef(false);
  slugTouchedRef.current = slugTouched;

  useEffect(() => {
    void fetchPages();
  }, []);

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
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setIsEditing(true);
  }

  async function openEdit(pageId: string, slugLocked: boolean) {
    try {
      setIsLoadingEdit(true);
      setFormError(null);
      const page = await adminApiClient.get<CmsPageDetail>(`/api/cms/pages/${pageId}`);
      if (!page) {
        setFormError("Page not found");
        return;
      }
      const content = parseContent(page.content);
      setForm({
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
      setSlugTouched(true);
      setIsEditing(true);
    } catch {
      setError("Failed to load page for editing");
    } finally {
      setIsLoadingEdit(false);
    }
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !prev.id && !prev.slugLocked && !slugTouchedRef.current ? slugify(title) : prev.slug,
    }));
  }

  async function handleHeroChange(files: Array<File | string>) {
    const next = files[0];
    if (!next) {
      setForm((prev) => ({ ...prev, heroImage: "" }));
      return;
    }
    if (typeof next === "string") {
      setForm((prev) => ({ ...prev, heroImage: next }));
      return;
    }
    setIsUploadingHero(true);
    setFormError(null);
    try {
      const result = await uploadFile(next, "GALLERY_IMAGE");
      setForm((prev) => ({ ...prev, heroImage: result.url }));
    } catch {
      setFormError("Failed to upload hero image. Please try again.");
    } finally {
      setIsUploadingHero(false);
    }
  }

  async function savePage(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    const slug = form.slugLocked ? form.slug : slugify(form.slug.trim() || form.title);
    if (!slug) {
      setFormError("Slug is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const heroImage = typeof form.heroImage === "string" ? form.heroImage.trim() : "";
    const payload = {
      title: form.title.trim(),
      slug,
      status,
      content: {
        body: form.body,
        excerpt: form.excerpt,
        heroEyebrow: form.heroEyebrow.trim() || undefined,
        heroSubtitle: form.heroSubtitle.trim() || undefined,
        heroImage: heroImage || undefined,
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
      setForm(EMPTY_FORM);
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
    await adminApiClient.put("/api/cms/config", {
      key: CUSTOM_PAGE_LINKS_KEY,
      value: next,
    });
  }

  async function addToNav(item: SitePageListItem) {
    if (!item.id) return;
    setLinkBusyId(`${item.registryId}-nav`);
    try {
      const current = await loadCustomLinks();
      const url = item.publicPath;
      if (current.nav.some((l) => l.url === url)) {
        alert("Already in navigation links.");
        return;
      }
      await saveCustomLinks({
        ...current,
        nav: [...current.nav, { label: item.label, url }],
      });
      alert(`Added “${item.label}” to navigation.`);
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
      const url = item.publicPath;
      if (current.footer.some((l) => l.url === url)) {
        alert("Already in footer links.");
        return;
      }
      await saveCustomLinks({
        ...current,
        footer: [...current.footer, { label: item.label, url, column: "Company" }],
      });
      alert(`Added “${item.label}” to footer (Company).`);
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
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
          >
            + Create custom page
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input
              value={form.slug}
              disabled={form.slugLocked}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono disabled:opacity-60"
            />
            {form.slugLocked ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Slug is locked for this site page so the public URL stays stable.
              </p>
            ) : form.slug ? (
              <p className="mt-1 text-[11px] text-muted-foreground font-mono">
                Custom URL: /p/{slugify(form.slug) || form.slug}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1">Hero eyebrow</label>
              <input
                value={form.heroEyebrow}
                onChange={(e) => setForm((prev) => ({ ...prev, heroEyebrow: e.target.value }))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="Optional label above the title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Hero subtitle</label>
              <input
                value={form.heroSubtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="Short supporting line"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Excerpt</label>
            <input
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              placeholder="Brief summary for listings / SEO fallback"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Hero image</label>
            <ImageUploader
              label=""
              multiple={false}
              value={form.heroImage ? [form.heroImage] : []}
              onChange={(files) => void handleHeroChange(files)}
            />
            {isUploadingHero && (
              <p className="mt-2 text-xs text-muted-foreground">Uploading hero image…</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Body / Content</label>
            <CmsRichTextEditor
              value={form.body}
              onChange={(body) => setForm((prev) => ({ ...prev, body }))}
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">SEO</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Meta Title</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Current status:{" "}
              <span className="font-semibold text-foreground">
                {form.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isSaving || isUploadingHero}
                onClick={() => {
                  setIsEditing(false);
                  setFormError(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving || isUploadingHero}
                onClick={() => void savePage("DRAFT")}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save as Draft"}
              </button>
              <button
                type="button"
                disabled={isSaving || isUploadingHero}
                onClick={() => void savePage("PUBLISHED")}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Publish"}
              </button>
            </div>
          </div>
        </div>
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
                      {item.slug ? (
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.slug}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void copyPath(item.publicPath)}
                        className="font-mono text-[11px] text-primary hover:underline"
                        title="Copy public path"
                      >
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
                        <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                          Managed elsewhere
                        </span>
                      ) : (
                        <span
                          className={
                            isPublished
                              ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                              : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          }
                        >
                          {isPublished ? "Published" : item.status || "Draft"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                        {isCatalog && item.manageHref ? (
                          <Link href={item.manageHref} className="text-primary hover:underline">
                            Manage →
                          </Link>
                        ) : null}
                        {!isCatalog && item.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void openEdit(item.id!, !isCustom(item))}
                              className="text-primary hover:underline"
                            >
                              Edit
                            </button>
                            {isPublished ? (
                              <>
                                <button
                                  type="button"
                                  disabled={linkBusyId === `${item.registryId}-nav`}
                                  onClick={() => void addToNav(item)}
                                  className="text-primary hover:underline disabled:opacity-50"
                                >
                                  Add to nav
                                </button>
                                <button
                                  type="button"
                                  disabled={linkBusyId === `${item.registryId}-footer`}
                                  onClick={() => void addToFooter(item)}
                                  className="text-primary hover:underline disabled:opacity-50"
                                >
                                  Add to footer
                                </button>
                              </>
                            ) : null}
                            {isCustom(item) ? (
                              <button
                                type="button"
                                onClick={() => setPageToDelete(item.id)}
                                className="text-destructive hover:underline"
                              >
                                Delete
                              </button>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No pages returned from the API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPageToDelete(null)}
            aria-label="Cancel"
          />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Page</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this custom page?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPageToDelete(null)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
