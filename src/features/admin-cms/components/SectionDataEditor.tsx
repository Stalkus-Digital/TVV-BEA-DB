"use client";

import type { HomeSection } from "../types";
import type { HomeSectionType } from "../section-meta";

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v : "";
}

function num(data: Record<string, unknown>, key: string, fallback = 0): number {
  const v = data[key];
  return typeof v === "number" ? v : fallback;
}

function setField(
  data: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> {
  return { ...data, [key]: value };
}

const inputClass =
  "w-full bg-background border border-input rounded-md px-3 py-2 text-sm";
const labelClass = "block text-xs font-medium mb-1";

interface Props {
  type: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        className={inputClass}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        className={`${inputClass} min-h-[80px]`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function HeaderFields({ data, onChange }: { data: Record<string, unknown>; onChange: Props["onChange"] }) {
  return (
    <>
      <TextField
        label="Eyebrow"
        value={str(data, "eyebrow")}
        onChange={(v) => onChange(setField(data, "eyebrow", v))}
      />
      <TextField
        label="Title"
        value={str(data, "title")}
        onChange={(v) => onChange(setField(data, "title", v))}
      />
      <TextArea
        label="Description"
        value={str(data, "description")}
        onChange={(v) => onChange(setField(data, "description", v))}
      />
    </>
  );
}

function LimitField({ data, onChange }: { data: Record<string, unknown>; onChange: Props["onChange"] }) {
  return (
    <div>
      <label className={labelClass}>Item limit</label>
      <input
        type="number"
        min={1}
        max={48}
        className={inputClass}
        value={num(data, "limit", 8)}
        onChange={(e) => onChange(setField(data, "limit", Number(e.target.value) || 1))}
      />
    </div>
  );
}

function LinkListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { label: string; href: string }[];
  onChange: (items: { label: string; href: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            placeholder="Label"
            className={inputClass}
            value={item.label}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], label: e.target.value };
              onChange(next);
            }}
          />
          <input
            placeholder="Href"
            className={inputClass}
            value={item.href}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], href: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-md bg-destructive text-destructive-foreground"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
          >
            X
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-slate-900 hover:underline"
        onClick={() => onChange([...items, { label: "", href: "" }])}
      >
        + Add
      </button>
    </div>
  );
}

function StatListEditor({
  items,
  onChange,
}: {
  items: { value: string; label: string }[];
  onChange: (items: { value: string; label: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass}>Stats</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            placeholder="Value"
            className={inputClass}
            value={item.value}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], value: e.target.value };
              onChange(next);
            }}
          />
          <input
            placeholder="Label"
            className={inputClass}
            value={item.label}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...next[idx], label: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-md bg-destructive text-destructive-foreground"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
          >
            X
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-slate-900 hover:underline"
        onClick={() => onChange([...items, { value: "", label: "" }])}
      >
        + Add stat
      </button>
    </div>
  );
}

export function SectionDataEditor({ type, data, onChange }: Props) {
  const t = type as HomeSectionType;

  if (t === "hero") {
    const trending = Array.isArray(data.trending)
      ? (data.trending as { label: string; href: string }[])
      : [];
    const stats = Array.isArray(data.stats) ? (data.stats as { value: string; label: string }[]) : [];
    const images = Array.isArray(data.images) ? (data.images as string[]) : ["", "", ""];
    const ratingBadge =
      data.ratingBadge && typeof data.ratingBadge === "object"
        ? (data.ratingBadge as { value?: string; label?: string })
        : {};
    const locationBadge =
      data.locationBadge && typeof data.locationBadge === "object"
        ? (data.locationBadge as { title?: string; subtitle?: string })
        : {};

    return (
      <div className="space-y-4">
        <TextField
          label="Eyebrow"
          value={str(data, "eyebrow")}
          onChange={(v) => onChange(setField(data, "eyebrow", v))}
        />
        <TextField
          label="Headline"
          value={str(data, "headline")}
          onChange={(v) => onChange(setField(data, "headline", v))}
          required
        />
        <TextArea
          label="Subheadline"
          value={str(data, "subheadline")}
          onChange={(v) => onChange(setField(data, "subheadline", v))}
        />
        <TextField
          label="Search placeholder"
          value={str(data, "searchPlaceholder")}
          onChange={(v) => onChange(setField(data, "searchPlaceholder", v))}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <TextField
              key={i}
              label={`Collage image ${i + 1} URL`}
              value={images[i] ?? ""}
              onChange={(v) => {
                const next = [...images];
                while (next.length < 3) next.push("");
                next[i] = v;
                onChange(setField(data, "images", next));
              }}
            />
          ))}
        </div>
        <LinkListEditor
          label="Trending links"
          items={trending}
          onChange={(items) => onChange(setField(data, "trending", items))}
        />
        <StatListEditor items={stats} onChange={(items) => onChange(setField(data, "stats", items))} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Rating badge value"
            value={ratingBadge.value ?? ""}
            onChange={(v) =>
              onChange(setField(data, "ratingBadge", { ...ratingBadge, value: v }))
            }
          />
          <TextField
            label="Rating badge label"
            value={ratingBadge.label ?? ""}
            onChange={(v) =>
              onChange(setField(data, "ratingBadge", { ...ratingBadge, label: v }))
            }
          />
          <TextField
            label="Location badge title"
            value={locationBadge.title ?? ""}
            onChange={(v) =>
              onChange(setField(data, "locationBadge", { ...locationBadge, title: v }))
            }
          />
          <TextField
            label="Location badge subtitle"
            value={locationBadge.subtitle ?? ""}
            onChange={(v) =>
              onChange(setField(data, "locationBadge", { ...locationBadge, subtitle: v }))
            }
          />
        </div>
      </div>
    );
  }

  if (t === "trustBar") {
    const stats = Array.isArray(data.stats) ? (data.stats as { value: string; label: string }[]) : [];
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Leave stats empty to use live trust stats from reviews. Add overrides to replace them.
        </p>
        <StatListEditor items={stats} onChange={(items) => onChange(setField(data, "stats", items))} />
      </div>
    );
  }

  if (t === "andamanSpotlight") {
    return (
      <div className="space-y-4">
        <HeaderFields data={data} onChange={onChange} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="View all label"
            value={str(data, "viewAllLabel")}
            onChange={(v) => onChange(setField(data, "viewAllLabel", v))}
          />
          <TextField
            label="View all href"
            value={str(data, "viewAllHref")}
            onChange={(v) => onChange(setField(data, "viewAllHref", v))}
          />
        </div>
        <TextField
          label="Strip eyebrow"
          value={str(data, "stripEyebrow")}
          onChange={(v) => onChange(setField(data, "stripEyebrow", v))}
        />
        <TextArea
          label="Strip title"
          value={str(data, "stripTitle")}
          onChange={(v) => onChange(setField(data, "stripTitle", v))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Primary CTA label"
            value={str(data, "primaryCtaLabel")}
            onChange={(v) => onChange(setField(data, "primaryCtaLabel", v))}
          />
          <TextField
            label="Primary CTA href"
            value={str(data, "primaryCtaHref")}
            onChange={(v) => onChange(setField(data, "primaryCtaHref", v))}
          />
          <TextField
            label="Secondary CTA label"
            value={str(data, "secondaryCtaLabel")}
            onChange={(v) => onChange(setField(data, "secondaryCtaLabel", v))}
          />
          <TextField
            label="Secondary CTA href"
            value={str(data, "secondaryCtaHref")}
            onChange={(v) => onChange(setField(data, "secondaryCtaHref", v))}
          />
        </div>
      </div>
    );
  }

  if (
    t === "destinationTabs" ||
    t === "featuredJourneys" ||
    t === "editorialGuides" ||
    t === "experiences" ||
    t === "testimonials"
  ) {
    return (
      <div className="space-y-4">
        <HeaderFields data={data} onChange={onChange} />
        {(t === "experiences" || t === "editorialGuides" || t === "testimonials") && (
          <LimitField data={data} onChange={onChange} />
        )}
      </div>
    );
  }

  if (t === "reels") {
    return (
      <div className="space-y-4">
        <TextField
          label="Instagram handle"
          value={str(data, "handle")}
          onChange={(v) => onChange(setField(data, "handle", v))}
        />
        <TextField
          label="Title"
          value={str(data, "title")}
          onChange={(v) => onChange(setField(data, "title", v))}
        />
        <TextArea
          label="Description"
          value={str(data, "description")}
          onChange={(v) => onChange(setField(data, "description", v))}
        />
        <TextField
          label="Profile URL"
          value={str(data, "profileUrl")}
          onChange={(v) => onChange(setField(data, "profileUrl", v))}
        />
        <TextField
          label="CTA label"
          value={str(data, "ctaLabel")}
          onChange={(v) => onChange(setField(data, "ctaLabel", v))}
        />
      </div>
    );
  }

  if (t === "conciergeCta") {
    return (
      <div className="space-y-4">
        <HeaderFields data={data} onChange={onChange} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Primary label"
            value={str(data, "primaryLabel")}
            onChange={(v) => onChange(setField(data, "primaryLabel", v))}
          />
          <TextField
            label="Primary href"
            value={str(data, "primaryHref")}
            onChange={(v) => onChange(setField(data, "primaryHref", v))}
          />
          <TextField
            label="Secondary label"
            value={str(data, "secondaryLabel")}
            onChange={(v) => onChange(setField(data, "secondaryLabel", v))}
          />
          <TextField
            label="Secondary href"
            value={str(data, "secondaryHref")}
            onChange={(v) => onChange(setField(data, "secondaryHref", v))}
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">No editable fields for this section type.</p>
  );
}

export type { HomeSection };
