"use client";

import { useEffect, useState } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { CmsEditorForm, EMPTY_EDITOR_FORM, slugify, todayDateInput, type CmsEditorFormState } from "./CmsEditorForm";
import { adminApiClient } from "@/lib/admin-api/client";

interface GuideContent {
  body?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishDate?: string;
}

interface Guide {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  content?: GuideContent | null;
}

function parseContent(raw: Guide["content"]): GuideContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as GuideContent;
}

function contentCategory(content: GuideContent): string {
  return typeof content.category === "string" && content.category.trim()
    ? content.category.trim()
    : "Guides";
}

function contentTags(content: GuideContent): string[] {
  if (!Array.isArray(content.tags)) return [];
  return content.tags
    .filter((t): t is string => typeof t === "string")
    .map(slugify)
    .filter(Boolean);
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CmsEditorFormState>(EMPTY_EDITOR_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { void fetchGuides(); }, []);

  async function fetchGuides() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApiClient.get<{ items: Guide[] }>("/api/cms/guides");
      if (res?.items) setGuides(res.items);
    } catch {
      setError("Failed to fetch guides");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setForm({ ...EMPTY_EDITOR_FORM, publishDate: todayDateInput(), author: "TVV Editorial" });
    setFormError(null);
    setIsEditing(true);
  }

  async function openEdit(guideId: string) {
    try {
      setIsLoading(true);
      const guide = await adminApiClient.get<Guide>(`/api/cms/guides/${guideId}`);
      if (!guide) { setFormError("Guide not found"); return; }
      const content = parseContent(guide.content);
      setForm({
        ...EMPTY_EDITOR_FORM,
        id: guide.id,
        title: guide.title,
        slug: guide.slug,
        status: guide.status,
        body: content.body ?? "",
        excerpt: content.excerpt ?? "",
        metaTitle: content.metaTitle ?? "",
        metaDescription: content.metaDescription ?? "",
        coverImage: typeof content.coverImage === "string" ? content.coverImage : "",
        category: contentCategory(content) === "Guides" ? "Andaman" : contentCategory(content),
        tags: contentTags(content),
        author: typeof content.author === "string" && content.author.trim() ? content.author.trim() : "TVV Editorial",
        publishDate:
          typeof content.publishDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(content.publishDate)
            ? content.publishDate.slice(0, 10)
            : guide.createdAt?.slice(0, 10) ?? todayDateInput(),
      });
      setFormError(null);
      setIsEditing(true);
    } catch {
      setError("Failed to load guide for editing");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveGuide(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    const slug = slugify(form.slug.trim() || form.title);
    if (!slug) { setFormError("Slug is required"); return; }
    if (!form.category.trim()) { setFormError("Category is required"); return; }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      slug,
      status,
      content: {
        body: form.body,
        excerpt: form.excerpt,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        coverImage: form.coverImage.trim(),
        category: form.category.trim(),
        tags: form.tags,
        author: form.author.trim() || "TVV Editorial",
        ...(form.publishDate ? { publishDate: form.publishDate } : {}),
      },
    };

    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/guides/${form.id}`, payload);
      } else {
        await adminApiClient.post("/api/cms/guides", payload);
      }
      setIsEditing(false);
      setForm(EMPTY_EDITOR_FORM);
      await fetchGuides();
    } catch {
      setFormError("Failed to save guide. Check that the slug is unique and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePublish(guide: Guide) {
    const nextStatus = guide.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setStatusUpdatingId(guide.id);
    try {
      const content = parseContent(guide.content);
      await adminApiClient.put(`/api/cms/guides/${guide.id}`, {
        title: guide.title,
        slug: guide.slug,
        status: nextStatus,
        content,
      });
      await fetchGuides();
    } catch {
      setError(`Failed to ${nextStatus === "PUBLISHED" ? "publish" : "unpublish"} guide`);
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!guideToDelete) return;
    setIsDeleting(true);
    try {
      await adminApiClient.delete(`/api/cms/guides/${guideToDelete}`);
      setGuideToDelete(null);
      await fetchGuides();
    } catch {
      setError("Failed to delete guide");
    } finally {
      setIsDeleting(false);
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
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
          >
            + Create Guide
          </button>
        )}
      </div>

      {isEditing ? (
        <CmsEditorForm
          form={form}
          onChange={setForm}
          isSaving={isSaving}
          formError={formError}
          showGuideFields
          onCancel={() => { setIsEditing(false); setFormError(null); }}
          onSaveDraft={() => void saveGuide("DRAFT")}
          onPublish={() => void saveGuide("PUBLISHED")}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Tags</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => {
                const isPublished = guide.status === "PUBLISHED";
                const isUpdating = statusUpdatingId === guide.id;
                const content = parseContent(guide.content);
                const category = contentCategory(content);
                const tags = contentTags(content);
                return (
                  <tr key={guide.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{guide.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{guide.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{category}</td>
                    <td className="px-4 py-3">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <span key={tag} className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <button type="button" onClick={() => void openEdit(guide.id)} className="text-sm font-medium text-slate-900 hover:underline">
                        Edit
                      </button>
                      <button type="button" disabled={isUpdating} onClick={() => void togglePublish(guide)} className="text-sm font-medium text-slate-700 hover:underline disabled:opacity-50">
                        {isUpdating ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button type="button" onClick={() => setGuideToDelete(guide.id)} className="text-sm font-medium text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {guides.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No guides found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {guideToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setGuideToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Guide</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this guide? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={isDeleting} onClick={() => setGuideToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
