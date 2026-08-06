"use client";

import { useRef } from "react";
import { CmsRichTextEditor } from "./CmsRichTextEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { uploadFile } from "@/lib/admin-api/upload";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const GUIDE_CATEGORIES = [
  "Andaman",
  "Kerala",
  "Maldives",
  "Honeymoon",
  "Luxury",
  "Ferry Guide",
  "International",
  "Bali",
  "Dubai",
  "Leh-Ladakh",
  "Packing Tips",
  "Travel Hacks",
  "Hotel Reviews",
] as const;

const CUSTOM_CATEGORY = "__custom__";

// ─── Utilities ─────────────────────────────────────────────────────────────────

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeTag(value: string): string {
  return slugify(value);
}

export function todayDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Shared form state type ────────────────────────────────────────────────────

export interface CmsEditorFormState {
  id: string;
  title: string;
  slug: string;
  status: string;
  body: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  /** For pages */
  heroImage: string;
  heroEyebrow: string;
  heroSubtitle: string;
  slugLocked: boolean;
  /** For guides */
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
}

export const EMPTY_EDITOR_FORM: CmsEditorFormState = {
  id: "",
  title: "",
  slug: "",
  status: "DRAFT",
  body: "",
  excerpt: "",
  metaTitle: "",
  metaDescription: "",
  heroImage: "",
  heroEyebrow: "",
  heroSubtitle: "",
  slugLocked: false,
  coverImage: "",
  category: "Andaman",
  tags: [],
  author: "TVV Editorial",
  publishDate: todayDateInput(),
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CmsEditorFormProps {
  form: CmsEditorFormState;
  onChange: (updated: CmsEditorFormState) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  formError: string | null;
  /** If true, renders Guide-specific fields (Author, Category, Tags, Cover Image, Publish Date) */
  showGuideFields?: boolean;
  /** If true, renders Page-specific fields (Hero Eyebrow, Hero Subtitle, Hero Image) */
  showPageFields?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CmsEditorForm({
  form,
  onChange,
  onCancel,
  onSaveDraft,
  onPublish,
  isSaving,
  formError,
  showGuideFields = false,
  showPageFields = false,
}: CmsEditorFormProps) {
  const slugTouchedRef = useRef(false);

  function set(patch: Partial<CmsEditorFormState>) {
    onChange({ ...form, ...patch });
  }

  function handleTitleChange(title: string) {
    set({
      title,
      slug: !form.id && !slugTouchedRef.current && !form.slugLocked ? slugify(title) : form.slug,
    });
  }

  function handleSlugChange(raw: string) {
    slugTouchedRef.current = true;
    set({ slug: slugify(raw) || raw });
  }

  async function handleImageChange(field: "heroImage" | "coverImage", files: Array<File | string>) {
    const next = files[0];
    if (!next) { set({ [field]: "" }); return; }
    if (typeof next === "string") { set({ [field]: next }); return; }
    try {
      const result = await uploadFile(next, "GALLERY_IMAGE");
      set({ [field]: result.url });
    } catch {
      // Error is surfaced by the parent component's formError state
    }
  }

  function addTag(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag || form.tags.includes(tag)) return;
    set({ tags: [...form.tags, tag] });
  }

  function removeTag(tag: string) {
    set({ tags: form.tags.filter((t) => t !== tag) });
  }

  const categoryMode: "preset" | "custom" = (GUIDE_CATEGORIES as readonly string[]).includes(form.category)
    ? "preset"
    : "custom";

  const categorySelectValue = categoryMode === "custom" ? CUSTOM_CATEGORY : form.category;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-medium mb-1">Slug</label>
        <input
          required
          value={form.slug}
          disabled={form.slugLocked}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono disabled:opacity-60"
          placeholder="url-friendly-slug"
        />
        {form.slugLocked ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Slug is locked for this site page so the public URL stays stable.
          </p>
        ) : form.slug ? (
          <p className="mt-1 text-[11px] text-muted-foreground font-mono">
            {showPageFields ? `Custom URL: /p/${form.slug}` : `/guides/${form.slug}`}
          </p>
        ) : null}
      </div>

      {/* Guide-specific fields */}
      {showGuideFields && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={categorySelectValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === CUSTOM_CATEGORY) {
                    const current = (GUIDE_CATEGORIES as readonly string[]).includes(form.category) ? "" : form.category;
                    set({ category: current });
                    return;
                  }
                  set({ category: value });
                }}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              >
                {GUIDE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value={CUSTOM_CATEGORY}>Custom…</option>
              </select>
              {categoryMode === "custom" && (
                <input
                  value={form.category}
                  onChange={(e) => set({ category: e.target.value })}
                  className="mt-2 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="Custom category name"
                />
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium mb-1">Tags</label>
              <input
                placeholder="Add tag + Enter"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    addTag(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                    >
                      {tag}<span aria-hidden className="text-slate-400">×</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">Used as filters on the public guides page.</p>
            </div>
          </div>

          {/* Author + Publish Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1">Author</label>
              <input
                value={form.author}
                onChange={(e) => set({ author: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="TVV Editorial"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Shown as "Words by …" on the guide page.</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Publish date</label>
              <input
                type="date"
                value={form.publishDate}
                onChange={(e) => set({ publishDate: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Month and year shown in the hero byline.</p>
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium mb-1">Cover Image</label>
            <ImageUploader
              label=""
              multiple={false}
              value={form.coverImage ? [form.coverImage] : []}
              onChange={(files) => void handleImageChange("coverImage", files)}
            />
          </div>
        </>
      )}

      {/* Page-specific fields */}
      {showPageFields && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1">Hero eyebrow</label>
              <input
                value={form.heroEyebrow}
                onChange={(e) => set({ heroEyebrow: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="Optional label above the title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Hero subtitle</label>
              <input
                value={form.heroSubtitle}
                onChange={(e) => set({ heroSubtitle: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="Short supporting line"
              />
            </div>
          </div>

          {/* Hero image */}
          <div>
            <label className="block text-xs font-medium mb-1">Hero image</label>
            <ImageUploader
              label=""
              multiple={false}
              value={form.heroImage ? [form.heroImage] : []}
              onChange={(files) => void handleImageChange("heroImage", files)}
            />
          </div>
        </>
      )}

      {/* Excerpt (shared) */}
      <div>
        <label className="block text-xs font-medium mb-1">
          Excerpt {showGuideFields ? "(short summary)" : "(SEO fallback)"}
        </label>
        <input
          value={form.excerpt}
          onChange={(e) => set({ excerpt: e.target.value })}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
          placeholder="Brief description shown in listings…"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium mb-1">Body / Content</label>
        <CmsRichTextEditor
          value={form.body}
          onChange={(body) => set({ body })}
        />
      </div>

      {/* SEO (shared) */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">SEO</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => set({ metaTitle: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={form.metaDescription}
              onChange={(e) => set({ metaDescription: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
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
            disabled={isSaving}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveDraft}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save as Draft"}
          </button>
          {form.id && form.status === "PUBLISHED" && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveDraft}
              className="px-4 py-2 text-sm font-medium rounded-md border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
          <button
            type="button"
            disabled={isSaving}
            onClick={onPublish}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
