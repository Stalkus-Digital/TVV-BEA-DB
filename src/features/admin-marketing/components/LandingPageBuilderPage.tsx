"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiClient } from "@/lib/admin-api/client";
import { uploadFiles } from "@/lib/admin-api/upload";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { MarketingPageShell } from "./MarketingPageShell";
import { ExternalLink, Edit2, Trash2, Plus, X, Check, Globe, Copy, Eye } from "lucide-react";

const WEBSITE_BASE = (process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? "").replace(/\/$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  status: string;
  heroHeadline?: string;
  locationBadge?: string;
  priceFrom?: number;
  whatsappNumber?: string;
  phoneNumber?: string;
  metaPixelId?: string;
  googleAdsTag?: string;
  googleAdsConversionId?: string;
  packageSlugs?: string[];
  activities?: { name: string }[];
  faqs?: { q: string; a: string }[];
  usps?: string[];
  testimonials?: { author: string; text: string; rating: number; role: string }[];
  heroImage?: string;
  mobileHeroImage?: string;
  videoUrl?: string;
  heroSubheadline?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  advancedSchema?: any;
  campaignTag?: string;
  offerEndDate?: string | Date;
  remainingSlots?: number;
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM: Partial<LandingPage> = {
  title: "",
  slug: "",
  heroHeadline: "",
  heroSubheadline: "",
  heroImage: "",
  locationBadge: "",
  priceFrom: undefined,
  whatsappNumber: "916297919122",
  phoneNumber: "+916297919122",
  metaPixelId: "",
  googleAdsTag: "",
  googleAdsConversionId: "",
  packageSlugs: [],
  activities: [],
  faqs: [],
  usps: ["All-inclusive trips — stays, ferries & transfers", "Custom itinerary in 10 minutes", "Up to 40% OFF for early bookings", "24/7 local support on ground"],
  seoTitle: "",
  seoDescription: "",
  campaignTag: "",
  status: "DRAFT",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function LandingPageBuilderPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"list" | "builder">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<LandingPage>>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isDuplicatingId, setIsDuplicatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const pagesQuery = useQuery({
    queryKey: ["admin", "landing-pages"],
    queryFn: async () => {
      const res = await adminApiClient.get<LandingPage[]>("/api/admin/landing-pages");
      return Array.isArray(res) ? res : [];
    },
  });

  const pages = pagesQuery.data ?? [];

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setActiveTab(0);
    setMode("builder");
  }

  function openEdit(page: LandingPage) {
    setForm({
      ...page,
      packageSlugs: (page.packageSlugs as any) ?? [],
      activities: (page.activities as any) ?? [],
      faqs: (page.faqs as any) ?? [],
      usps: (page.usps as any) ?? [],
    });
    setEditingId(page.id);
    setActiveTab(0);
    setMode("builder");
  }

  async function handleSave() {
    if (!form.title || !form.slug) { setSaveError("Title and slug are required."); return; }
    setSaveError(null);
    setIsSaving(true);
    try {
      const payload = { ...form };
      
      if ((payload.heroImage as any) instanceof File) {
        const [res] = await uploadFiles([payload.heroImage as unknown as File], "MARKETING_IMAGE");
        payload.heroImage = res.url;
      }
      if ((payload.mobileHeroImage as any) instanceof File) {
        const [res] = await uploadFiles([payload.mobileHeroImage as unknown as File], "MARKETING_IMAGE");
        payload.mobileHeroImage = res.url;
      }
      if ((payload.videoUrl as any) instanceof File) {
        const [res] = await uploadFiles([payload.videoUrl as unknown as File], "MARKETING_VIDEO");
        payload.videoUrl = res.url;
      }

      let res: any;
      if (editingId) {
        res = await adminApiClient.put(`/api/admin/landing-pages/${editingId}`, payload);
      } else {
        res = await adminApiClient.post("/api/admin/landing-pages", payload);
      }
      // Surface 409 conflict (slug already in use)
      if (res?.success === false) {
        setSaveError(res.error ?? "Failed to save.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
      setMode("list");
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDuplicate(page: LandingPage) {
    setIsDuplicatingId(page.id);
    try {
      await adminApiClient.post(`/api/admin/landing-pages/${page.id}/duplicate`, {});
      await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
    } catch {
      alert("Failed to duplicate page.");
    } finally {
      setIsDuplicatingId(null);
    }
  }

  async function handlePublishToggle(page: LandingPage) {
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await adminApiClient.put(`/api/admin/landing-pages/${page.id}`, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this landing page? This cannot be undone.")) return;
    setIsDeletingId(id);
    try {
      await adminApiClient.delete(`/api/admin/landing-pages/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
    } catch {
      alert("Failed to delete.");
    } finally {
      setIsDeletingId(null);
    }
  }

  if (mode === "builder") {
    return (
      <BuilderView
        form={form}
        setForm={setForm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSaving={isSaving}
        saveError={saveError}
        setSaveError={setSaveError}
        editingId={editingId}
        onSave={handleSave}
        onCancel={() => { setMode("list"); setSaveError(null); }}
      />
    );
  }

  return (
    <MarketingPageShell
      title="Landing Pages"
      description="Create high-converting ad landing pages. Each page gets its own URL like thevacationvoice.in/lp/andaman."
      isLoading={pagesQuery.isLoading}
      isError={pagesQuery.isError}
      errorMessage="Failed to load landing pages"
      isRefreshing={pagesQuery.isFetching}
      onRefresh={() => void pagesQuery.refetch()}
      onRetry={() => void pagesQuery.refetch()}
      isEmpty={!pagesQuery.isLoading && pages.length === 0}
      emptyMessage="No landing pages yet. Create your first one!"
      actions={
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Create Landing Page
        </button>
      }
    >

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">URL</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-border last:border-0 align-middle">
                <td className="px-4 py-3">
                  <div className="font-medium">{page.title}</div>
                  {page.campaignTag && <div className="text-xs text-muted-foreground mt-0.5">{page.campaignTag}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/lp/{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    page.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {page.status === "PUBLISHED" ? <Check className="w-3 h-3" /> : null}
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    {/* Preview — opens draft or published page by ID */}
                    <a
                      href={`${WEBSITE_BASE}/lp/preview/${page.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Preview (draft-safe)"
                      className="text-muted-foreground hover:text-amber-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    {/* Live link — only useful when published */}
                    {page.status === "PUBLISHED" && (
                      <a
                        href={`${WEBSITE_BASE}/lp/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open live page"
                        className="text-muted-foreground hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {/* Publish toggle */}
                    <button
                      onClick={() => void handlePublishToggle(page)}
                      title={page.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      className={`text-muted-foreground transition-colors ${page.status === "PUBLISHED" ? "hover:text-amber-600" : "hover:text-emerald-600"}`}
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                    {/* Duplicate — for A/B testing */}
                    <button
                      onClick={() => void handleDuplicate(page)}
                      disabled={isDuplicatingId === page.id}
                      title="Duplicate for A/B test"
                      className="text-muted-foreground hover:text-purple-600 transition-colors disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(page)} title="Edit" className="text-muted-foreground hover:text-blue-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void handleDelete(page.id)}
                      disabled={isDeletingId === page.id}
                      title="Delete"
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketingPageShell>
  );
}

// ─── Builder View ─────────────────────────────────────────────────────────────

const TABS = ["Basic Info", "Hero & Scarcity", "Content & Trust", "FAQs", "Tracking & SEO"];

function BuilderView({ form, setForm, activeTab, setActiveTab, isSaving, saveError, setSaveError, editingId, onSave, onCancel }: {
  form: Partial<LandingPage>;
  setForm: React.Dispatch<React.SetStateAction<Partial<LandingPage>>>;
  activeTab: number;
  setActiveTab: (n: number) => void;
  isSaving: boolean;
  saveError: string | null;
  setSaveError: (e: string | null) => void;
  editingId: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  function f(key: keyof LandingPage) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{editingId ? "Edit Landing Page" : "New Landing Page"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Build a high-converting page for your ads</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50">
            {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Page"}
          </button>
        </div>
      </div>

      {/* Slug conflict / validation error */}
      {saveError && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="shrink-0 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0 — Basic Info */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <Field label="Internal Title *" hint="Only shown in CRM">
            <input value={form.title ?? ""} onChange={f("title")} className={input} placeholder="e.g. Andaman Summer Deals 2026" />
          </Field>
          <Field label="URL Slug *" hint={`Live at: thevacationvoice.in/lp/${form.slug || "your-slug"}`}>
            <input
              value={form.slug ?? ""}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
              className={input}
              placeholder="e.g. andaman"
            />
          </Field>
          <Field label="Status">
            <select value={form.status ?? "DRAFT"} onChange={f("status")} className={input}>
              <option value="DRAFT">Draft (not visible to public)</option>
              <option value="PUBLISHED">Published (live)</option>
            </select>
          </Field>
          <Field label="Campaign Tag" hint="For your own tracking — e.g. 'Google Ads - Andaman - July 2026'">
            <input value={form.campaignTag ?? ""} onChange={f("campaignTag")} className={input} placeholder="Google Ads - Andaman - July 2026" />
          </Field>
        </div>
      )}

      {/* Tab 1 — Hero & Scarcity */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ImageUploader
              label="Hero Image (Desktop) *"
              hint="Landscape image"
              value={form.heroImage ? [form.heroImage] : []}
              onChange={(files) => setForm(p => ({ ...p, heroImage: files[0] }))}
            />
            <ImageUploader
              label="Mobile Hero Image"
              hint="Portrait image (optimizes mobile load)"
              value={form.mobileHeroImage ? [form.mobileHeroImage] : []}
              onChange={(files) => setForm(p => ({ ...p, mobileHeroImage: files[0] }))}
            />
          </div>
          <ImageUploader
            label="Background Video (Optional)"
            hint="Upload an MP4 to autoplay in the background"
            acceptVideo={true}
            value={form.videoUrl ? [form.videoUrl] : []}
            onChange={(files) => setForm(p => ({ ...p, videoUrl: files[0] }))}
          />
          <Field label="Location Badge" hint="Small tag shown above headline — e.g. 'Andaman Islands'">
            <input value={form.locationBadge ?? ""} onChange={f("locationBadge")} className={input} placeholder="Andaman Islands" />
          </Field>
          <Field label="Main Headline *">
            <input value={form.heroHeadline ?? ""} onChange={f("heroHeadline")} className={input} placeholder="Andaman Holiday Packages" />
          </Field>
          <Field label="Subheadline / Price Line" hint="e.g. 'Starting ₹10,500 | Explore 572 Islands'">
            <input value={form.heroSubheadline ?? ""} onChange={f("heroSubheadline")} className={input} placeholder="Starting ₹10,500" />
          </Field>
          <Field label="Starting Price (₹)" hint="Numeric only — e.g. 10500">
            <input type="number" value={form.priceFrom ?? ""} onChange={e => setForm(p => ({ ...p, priceFrom: Number(e.target.value) || undefined }))} className={input} placeholder="10500" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp Number" hint="Country code + number, no +">
              <input value={form.whatsappNumber ?? ""} onChange={f("whatsappNumber")} className={input} placeholder="916297919122" />
            </Field>
            <Field label="Phone Number" hint="With + prefix">
              <input value={form.phoneNumber ?? ""} onChange={f("phoneNumber")} className={input} placeholder="+916297919122" />
            </Field>
          </div>
          <Field label="Why Us / USP Points" hint="One per line">
            <textarea
              rows={5}
              value={(form.usps ?? []).join("\n")}
              onChange={e => setForm(p => ({ ...p, usps: e.target.value.split("\n").filter(Boolean) }))}
              className={input}
              placeholder={"All-inclusive trips\nCustom itinerary in 10 minutes\nUp to 40% OFF"}
            />
          </Field>
          <hr className="border-border my-4" />
          <h3 className="font-semibold">Scarcity & Urgency (Optional)</h3>
          <p className="text-xs text-muted-foreground mb-2">Adding these elements creates FOMO and boosts conversion rates.</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Offer End Date" hint="YYYY-MM-DD or leave blank">
              <input
                type="date"
                value={form.offerEndDate ? (form.offerEndDate instanceof Date ? form.offerEndDate.toISOString() : String(form.offerEndDate)).split("T")[0] : ""}
                onChange={e => setForm(p => ({ ...p, offerEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                className={input}
              />
            </Field>
            <Field label="Remaining Slots" hint="e.g. 5">
              <input type="number" value={form.remainingSlots ?? ""} onChange={e => setForm(p => ({ ...p, remainingSlots: e.target.value ? Number(e.target.value) : undefined }))} className={input} placeholder="5" />
            </Field>
            <Field label="Discount %" hint="e.g. 20">
              <input type="number" value={form.discountPercentage ?? ""} onChange={e => setForm(p => ({ ...p, discountPercentage: e.target.value ? Number(e.target.value) : undefined }))} className={input} placeholder="20" />
            </Field>
          </div>
        </div>
      )}

      {/* Tab 2 — Content & Trust */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <Field label="Package Slugs to Feature" hint="One per line — must match exact slug from Packages section">
            <textarea
              rows={5}
              value={(form.packageSlugs ?? []).join("\n")}
              onChange={e => setForm(p => ({ ...p, packageSlugs: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))}
              className={input}
              placeholder={"andaman-honeymoon-luxury-getaway\nandaman-island-escape\nandaman-budget-explorer"}
            />
          </Field>
          <div>
            <label className="block text-sm font-medium mb-2">Activities / Experiences</label>
            <ActivityEditor items={form.activities ?? []} onChange={items => setForm(p => ({ ...p, activities: items }))} />
          </div>
          <hr className="border-border my-4" />
          <div>
            <TestimonialEditor items={form.testimonials ?? []} onChange={items => setForm(p => ({ ...p, testimonials: items }))} />
          </div>
        </div>
      )}

      {/* Tab 3 — FAQs */}
      {activeTab === 3 && (
        <div>
          <FaqEditor items={form.faqs ?? []} onChange={items => setForm(p => ({ ...p, faqs: items }))} />
        </div>
      )}

      {/* Tab 4 — Tracking & SEO */}
      {activeTab === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
            These tracking IDs fire when a visitor opens this landing page.
          </p>
          <Field label="Meta Pixel ID" hint="Numbers only — e.g. 1226523166034677">
            <input value={form.metaPixelId ?? ""} onChange={f("metaPixelId")} className={input} placeholder="1226523166034677" />
          </Field>
          <Field label="Google Ads Tag" hint="e.g. AW-16668991299">
            <input value={form.googleAdsTag ?? ""} onChange={f("googleAdsTag")} className={input} placeholder="AW-16668991299" />
          </Field>
          <Field label="Google Ads Conversion ID" hint="e.g. AW-16668991299/cOxECNf4i6QcEMO-sow-">
            <input value={form.googleAdsConversionId ?? ""} onChange={f("googleAdsConversionId")} className={input} placeholder="AW-16668991299/xxxxx" />
          </Field>
          <hr className="border-border my-2" />
          <Field label="SEO Title" hint="Shown in Google search results">
            <input value={form.seoTitle ?? ""} onChange={f("seoTitle")} className={input} placeholder="Andaman Tour Packages ₹10,500 | TVV 2026" />
          </Field>
          <Field label="SEO Description" hint="~155 characters for Google">
            <textarea rows={3} value={form.seoDescription ?? ""} onChange={f("seoDescription")} className={input} placeholder="All-inclusive Andaman trips with stays, ferries, transfers & local support. Starting ₹10,500/person." />
          </Field>
          <Field label="Canonical URL" hint="Leave blank unless this is an A/B test duplicate (e.g. https://thevacationvoice.in/lp/andaman)">
            <input value={form.canonicalUrl ?? ""} onChange={f("canonicalUrl")} className={input} placeholder="https://thevacationvoice.in/lp/main-page" />
          </Field>
          <Field label="Advanced Schema (JSON-LD)" hint="Optional — Paste FAQPage or Product schema JSON here">
            <textarea
              rows={6}
              value={typeof form.advancedSchema === "string" ? form.advancedSchema : form.advancedSchema ? JSON.stringify(form.advancedSchema, null, 2) : ""}
              onChange={e => {
                try {
                  const val = e.target.value;
                  setForm(p => ({ ...p, advancedSchema: val ? JSON.parse(val) : undefined }));
                } catch {
                  // Allow invalid typing temporarily, but ideally we only save valid JSON. 
                  // For simplicity in CRM, we just save as raw any and let backend parse if possible, 
                  // but here we just store the parsed obj. If error, we can store as string.
                  setForm(p => ({ ...p, advancedSchema: e.target.value as any }));
                }
              }}
              className={`${input} font-mono text-xs`}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Product"\n}'}
            />
          </Field>
        </div>
      )}

      {/* Bottom nav */}
      <div className="flex justify-between mt-8 pt-4 border-t border-border">
        <button
          onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
          disabled={activeTab === 0}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>
        {activeTab < TABS.length - 1 ? (
          <button onClick={() => setActiveTab(activeTab + 1)} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
            Next →
          </button>
        ) : (
          <button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50">
            {isSaving ? "Saving..." : "✓ Save & Finish"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const input = "w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function ActivityEditor({ items, onChange }: { items: { name: string }[]; onChange: (v: { name: string }[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item.name}
            onChange={e => { const n = [...items]; n[i] = { name: e.target.value }; onChange(n); }}
            className={`${input} flex-1`}
            placeholder="e.g. Scuba Diving at Elephant Beach"
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { name: "" }])} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Plus className="w-3.5 h-3.5" /> Add Activity
      </button>
    </div>
  );
}

function FaqEditor({ items, onChange }: { items: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">FAQs</label>
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-2 relative">
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 p-1 text-destructive hover:bg-destructive/10 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Question</label>
            <input
              value={item.q}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], q: e.target.value }; onChange(n); }}
              className={input}
              placeholder="What is included in the package?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Answer</label>
            <textarea
              rows={3}
              value={item.a}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], a: e.target.value }; onChange(n); }}
              className={input}
              placeholder="All packages include stays, ferry transfers..."
            />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, { q: "", a: "" }])} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Plus className="w-3.5 h-3.5" /> Add FAQ
      </button>
    </div>
  );
}

function TestimonialEditor({ items, onChange }: { items: { author: string; text: string; rating: number; role: string }[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Testimonials & Reviews (Optional)</label>
      <p className="text-xs text-muted-foreground">If provided, these will replace the default hardcoded trust badges.</p>
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative bg-slate-50/50">
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 p-1 text-destructive hover:bg-destructive/10 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Author Name</label>
              <input value={item.author || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], author: e.target.value }; onChange(n); }} className={input} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Role / Location</label>
              <input value={item.role || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], role: e.target.value }; onChange(n); }} className={input} placeholder="Traveler from Delhi" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Review Text</label>
            <textarea rows={2} value={item.text || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} className={input} placeholder="Amazing experience..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Rating (1-5)</label>
            <input type="number" min="1" max="5" value={item.rating || 5} onChange={e => { const n = [...items]; n[i] = { ...n[i], rating: Number(e.target.value) }; onChange(n); }} className={input} />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, { author: "", text: "", rating: 5, role: "" }])} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Plus className="w-3.5 h-3.5" /> Add Testimonial
      </button>
    </div>
  );
}

