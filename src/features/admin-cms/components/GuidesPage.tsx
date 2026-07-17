"use client";

import { useEffect, useRef, useState } from "react";
import { CmsPageShell } from "./CmsPageShell";
import { CmsRichTextEditor } from "./CmsRichTextEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { adminApiClient } from "@/lib/admin-api/client";
import { uploadFile } from "@/lib/admin-api/upload";

interface GuideContent {
  body?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string;
}

interface Guide {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  content?: GuideContent | null;
}

interface GuideFormState {
  id: string;
  title: string;
  slug: string;
  status: string;
  body: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
}

const EMPTY_FORM: GuideFormState = {
  id: "",
  title: "",
  slug: "",
  status: "DRAFT",
  body: "",
  excerpt: "",
  metaTitle: "",
  metaDescription: "",
  coverImage: "",
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

function parseContent(content: Guide["content"]): GuideContent {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  return content as GuideContent;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<GuideFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const slugTouchedRef = useRef(false);
  slugTouchedRef.current = slugTouched;

  useEffect(() => {
    void fetchGuides();
  }, []);

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
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setIsEditing(true);
  }

  async function openEdit(guideId: string) {
    try {
      setIsLoadingEdit(true);
      setFormError(null);
      const guide = await adminApiClient.get<Guide>(`/api/cms/guides/${guideId}`);
      if (!guide) {
        setFormError("Guide not found");
        return;
      }
      const content = parseContent(guide.content);
      setForm({
        id: guide.id,
        title: guide.title,
        slug: guide.slug,
        status: guide.status,
        body: content.body ?? "",
        excerpt: content.excerpt ?? "",
        metaTitle: content.metaTitle ?? "",
        metaDescription: content.metaDescription ?? "",
        coverImage: typeof content.coverImage === "string" ? content.coverImage : "",
      });
      setSlugTouched(true);
      setIsEditing(true);
    } catch {
      setError("Failed to load guide for editing");
    } finally {
      setIsLoadingEdit(false);
    }
  }

  async function saveGuide(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    const slug = form.slug.trim() || slugify(form.title);
    if (!slug) {
      setFormError("Slug is required");
      return;
    }

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
        coverImage: form.coverImage,
      },
    };

    try {
      if (form.id) {
        await adminApiClient.put(`/api/cms/guides/${form.id}`, payload);
      } else {
        await adminApiClient.post("/api/cms/guides", payload);
      }
      setIsEditing(false);
      setForm(EMPTY_FORM);
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

  async function handleCoverChange(files: Array<File | string>) {
    const next = files[0];
    if (!next) {
      setForm((prev) => ({ ...prev, coverImage: "" }));
      return;
    }
    if (typeof next === "string") {
      setForm((prev) => ({ ...prev, coverImage: next }));
      return;
    }

    setIsUploadingCover(true);
    setFormError(null);
    try {
      const result = await uploadFile(next, "GALLERY_IMAGE");
      setForm((prev) => ({ ...prev, coverImage: result.url }));
    } catch {
      setFormError("Failed to upload cover image. Please try again.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !prev.id && !slugTouchedRef.current ? slugify(title) : prev.slug,
    }));
  }

  return (
    <CmsPageShell
      title="Guides (Blogs)"
      description="Manage blog and guide articles."
      isLoading={isLoading || isLoadingEdit}
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: slugify(e.target.value) || e.target.value }));
              }}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono"
              placeholder="url-friendly-slug"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Excerpt (short summary)</label>
            <input
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              placeholder="Brief description shown in listings..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Cover Image</label>
            <ImageUploader
              label=""
              multiple={false}
              value={form.coverImage ? [form.coverImage] : []}
              onChange={(files) => void handleCoverChange(files)}
            />
            {isUploadingCover && (
              <p className="mt-2 text-xs text-muted-foreground">Uploading cover image…</p>
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
                disabled={isSaving || isUploadingCover}
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
                disabled={isSaving || isUploadingCover}
                onClick={() => void saveGuide("DRAFT")}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save as Draft"}
              </button>
              {form.id && form.status === "PUBLISHED" && (
                <button
                  type="button"
                  disabled={isSaving || isUploadingCover}
                  onClick={() => void saveGuide("DRAFT")}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50"
                >
                  Unpublish
                </button>
              )}
              <button
                type="button"
                disabled={isSaving || isUploadingCover}
                onClick={() => void saveGuide("PUBLISHED")}
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
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => {
                const isPublished = guide.status === "PUBLISHED";
                const isUpdating = statusUpdatingId === guide.id;
                return (
                  <tr key={guide.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{guide.title}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{guide.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <button
                        type="button"
                        onClick={() => void openEdit(guide.id)}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void togglePublish(guide)}
                        className="text-sm font-medium text-slate-700 hover:underline disabled:opacity-50"
                      >
                        {isUpdating ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideToDelete(guide.id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {guides.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No guides found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {guideToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setGuideToDelete(null)}
            aria-label="Cancel"
          />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Guide</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this guide? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setGuideToDelete(null)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
