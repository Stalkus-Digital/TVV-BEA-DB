"use client";

import { useRef, useState } from "react";
import {
  AlignLeft, CheckCircle, HelpCircle, Plus, Settings2,
  Sparkles, Trash2, Upload, X
} from "lucide-react";
import type { ArticleSection, SectionType } from "./guides-types";

// Shared field styles
export const fi =
  "w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground";

export function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

// ─── SECTION PREVIEW (canvas card body) ──────────────────────────────────────

export function SectionPreview({ sec }: { sec: ArticleSection }) {
  const bgStyle = sec.imageUrl
    ? { backgroundImage: ["url(", JSON.stringify(sec.imageUrl), ")"].join(""), backgroundSize: "cover" as const, backgroundPosition: "center" as const }
    : {};

  switch (sec.type) {
    case "hero":
      return (
        <div className="relative rounded-lg overflow-hidden min-h-[110px] bg-slate-200 flex items-end" style={bgStyle}>
          <div className="absolute inset-0 bg-slate-900/50" />
          <div className="relative z-10 p-3 text-white">
            <h2 className="text-sm font-black leading-tight">{sec.heading || "Hero Title"}</h2>
            <p className="text-[10px] text-white/80 mt-0.5">{sec.body?.slice(0, 80)}</p>
          </div>
        </div>
      );
    case "intro":
      return <p className="text-xs text-slate-700 leading-relaxed border-l-4 border-primary pl-3">{sec.body?.slice(0, 150)}</p>;
    case "richtext":
      return (
        <div>
          {sec.heading && <h3 className="text-xs font-bold text-slate-900 mb-1">{sec.heading}</h3>}
          <p className="text-[11px] text-slate-600 leading-relaxed">{sec.body?.slice(0, 100)}</p>
        </div>
      );
    case "image":
      return (
        <div className="space-y-1">
          <div className="h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {sec.imageUrl
              ? <img src={sec.imageUrl} alt={sec.imageAlt} className="w-full h-full object-cover" />
              : <div className="flex items-center justify-center h-full text-slate-400 text-xs">No image set</div>}
          </div>
          {sec.imageCaption && <p className="text-[9px] text-slate-500 text-center italic">{sec.imageCaption}</p>}
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-amber-400 pl-3">
          <p className="text-xs font-medium text-slate-800 italic">"{sec.quote}"</p>
          {sec.quoteAuthor && <cite className="text-[10px] text-slate-500 mt-0.5 block">— {sec.quoteAuthor}</cite>}
        </blockquote>
      );
    case "tips":
      return (
        <div>
          {sec.heading && <p className="text-xs font-bold text-slate-800 mb-1">{sec.heading}</p>}
          <ul className="space-y-0.5">
            {(sec.tips ?? []).slice(0, 4).map((t, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{t}
              </li>
            ))}
          </ul>
        </div>
      );
    case "faq":
      return (
        <div className="space-y-1.5">
          {(sec.faqs ?? []).slice(0, 3).map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-lg px-3 py-2">
              <p className="text-[11px] font-semibold text-slate-800">{f.q}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{f.a.slice(0, 60)}</p>
            </div>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
          <p className="text-xs font-bold text-primary">{sec.heading || "CTA Heading"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{sec.body}</p>
          <span className="mt-1.5 inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg">
            {sec.ctaText || "Book Now"}
          </span>
        </div>
      );
    case "toc":
      return (
        <div className="border border-dashed border-border rounded-lg p-3 text-[10px] text-muted-foreground text-center">
          📋 Table of Contents (auto-generated from headings)
        </div>
      );
    default:
      return null;
  }
}

// ─── SECTION CARD (canvas) ─────────────────────────────────────────────────────

export function SectionCard({
  sec, isActive, onClick, onRemove,
}: {
  sec: ArticleSection;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${isActive ? "ring-2 ring-primary border-primary" : "border-border hover:ring-1 hover:ring-primary/40"}`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-slate-50/80">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{sec.type}</span>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3">
        <SectionPreview sec={sec} />
      </div>
    </div>
  );
}

// ─── SECTION EDITOR (right panel) ─────────────────────────────────────────────

export function SectionEditor({
  sec, onUpdate, readFileAsDataUrl,
}: {
  sec: ArticleSection;
  onUpdate: (p: Partial<ArticleSection>) => void;
  readFileAsDataUrl: (f: File) => Promise<string>;
}) {
  const [newTip, setNewTip] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const hasHeading = ["hero", "richtext", "tips", "cta"].includes(sec.type);
  const hasBody = ["hero", "intro", "richtext", "cta"].includes(sec.type);
  const hasImage = ["hero", "image"].includes(sec.type);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Settings2 className="h-3 w-3" /> Editing: {sec.type}
      </p>

      {hasHeading && (
        <F label="Heading">
          <input value={sec.heading ?? ""} onChange={e => onUpdate({ heading: e.target.value })} className={fi} />
        </F>
      )}

      {hasBody && (
        <F label="Body Text">
          <textarea
            value={sec.body ?? ""}
            onChange={e => onUpdate({ body: e.target.value })}
            rows={6}
            className={`${fi} resize-none font-mono text-[11px]`}
            placeholder="Write your content here…"
          />
        </F>
      )}

      {hasImage && (
        <F label="Image">
          <div className="flex gap-1.5">
            <input
              value={sec.imageUrl ?? ""}
              onChange={e => onUpdate({ imageUrl: e.target.value })}
              className={`${fi} flex-1`}
              placeholder="https://…"
            />
            <label className="cursor-pointer flex items-center px-2 border border-border rounded-md text-muted-foreground hover:bg-muted">
              <Upload className="h-3.5 w-3.5" />
              <input
                ref={imgRef} type="file" accept="image/*" className="hidden"
                onChange={async e => { const f = e.target.files?.[0]; if (f) onUpdate({ imageUrl: await readFileAsDataUrl(f) }); }}
              />
            </label>
          </div>
          {sec.imageUrl && (
            <img src={sec.imageUrl} alt="" className="mt-1.5 w-full h-20 object-cover rounded-md border border-border" />
          )}
        </F>
      )}

      {sec.type === "image" && (
        <>
          <F label="Alt Text (for SEO)">
            <input value={sec.imageAlt ?? ""} onChange={e => onUpdate({ imageAlt: e.target.value })} className={fi} placeholder="Describe the image…" />
          </F>
          <F label="Caption">
            <input value={sec.imageCaption ?? ""} onChange={e => onUpdate({ imageCaption: e.target.value })} className={fi} />
          </F>
        </>
      )}

      {sec.type === "quote" && (
        <>
          <F label="Quote Text">
            <textarea value={sec.quote ?? ""} onChange={e => onUpdate({ quote: e.target.value })} rows={4} className={`${fi} resize-none italic`} />
          </F>
          <F label="Author / Source">
            <input value={sec.quoteAuthor ?? ""} onChange={e => onUpdate({ quoteAuthor: e.target.value })} className={fi} />
          </F>
        </>
      )}

      {sec.type === "tips" && (
        <div>
          <F label="Add Tip (press Enter)">
            <div className="flex gap-1.5">
              <input
                value={newTip}
                onChange={e => setNewTip(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newTip.trim()) { onUpdate({ tips: [...(sec.tips ?? []), newTip.trim()] }); setNewTip(""); }
                  }
                }}
                className={`${fi} flex-1`}
                placeholder="Tip text + Enter"
              />
              <button
                onClick={() => { if (newTip.trim()) { onUpdate({ tips: [...(sec.tips ?? []), newTip.trim()] }); setNewTip(""); } }}
                className="px-2 py-1.5 bg-primary text-primary-foreground rounded-md"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </F>
          <div className="space-y-1.5 mt-2">
            {(sec.tips ?? []).map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-2.5 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-xs flex-1">{t}</span>
                <button onClick={() => onUpdate({ tips: sec.tips?.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sec.type === "faq" && (
        <div className="space-y-2.5">
          {(sec.faqs ?? []).map((faq, i) => (
            <div key={i} className="bg-muted/30 border border-border rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Q{i + 1}</span>
                <button onClick={() => onUpdate({ faqs: sec.faqs?.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <F label="Question">
                <input
                  value={faq.q}
                  onChange={e => { const f = [...(sec.faqs ?? [])]; f[i] = { ...f[i], q: e.target.value }; onUpdate({ faqs: f }); }}
                  className={fi}
                />
              </F>
              <F label="Answer">
                <textarea
                  value={faq.a}
                  onChange={e => { const f = [...(sec.faqs ?? [])]; f[i] = { ...f[i], a: e.target.value }; onUpdate({ faqs: f }); }}
                  rows={3}
                  className={`${fi} resize-none`}
                />
              </F>
            </div>
          ))}
          <button
            onClick={() => onUpdate({ faqs: [...(sec.faqs ?? []), { q: "New question?", a: "Answer here." }] })}
            className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-border rounded-lg text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add FAQ
          </button>
        </div>
      )}

      {sec.type === "cta" && (
        <>
          <F label="Button Text">
            <input value={sec.ctaText ?? ""} onChange={e => onUpdate({ ctaText: e.target.value })} className={fi} />
          </F>
          <F label="Button URL">
            <input value={sec.ctaUrl ?? ""} onChange={e => onUpdate({ ctaUrl: e.target.value })} className={fi} placeholder="https://…" />
          </F>
          <F label="Sub-text">
            <input value={sec.ctaSubtext ?? ""} onChange={e => onUpdate({ ctaSubtext: e.target.value })} className={fi} placeholder="e.g. No commitment required" />
          </F>
        </>
      )}

      {sec.type === "toc" && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          Table of Contents is automatically generated from all section headings.
        </div>
      )}
    </div>
  );
}

// ─── ARTICLE PREVIEW (full preview mode) ──────────────────────────────────────

export function ArticlePreview({ article }: { article: { category: string; author: string; readTime: number; publishDate: string; sections: ArticleSection[] } }) {
  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
      {article.sections.map(sec => {
        const bgStyle = sec.imageUrl
          ? { backgroundImage: ["url(", JSON.stringify(sec.imageUrl), ")"].join(""), backgroundSize: "cover" as const, backgroundPosition: "center" as const }
          : { background: "#1e293b" };

        switch (sec.type) {
          case "hero":
            return (
              <div key={sec.id} className="relative min-h-56 flex items-end" style={bgStyle}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/10" />
                <div className="relative z-10 p-7 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-white/10 px-2 py-1 rounded-full">{article.category}</span>
                  <h1 className="text-2xl font-black mt-3 leading-tight">{sec.heading}</h1>
                  <p className="text-sm text-white/80 mt-2">{sec.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                    <span>By {article.author}</span>
                    <span>·</span>
                    <span>{article.readTime} min read</span>
                    <span>·</span>
                    <span>{article.publishDate}</span>
                  </div>
                </div>
              </div>
            );
          case "intro":
            return <div key={sec.id} className="px-7 py-5 border-l-4 border-primary ml-7 mr-7 mt-5 text-slate-700 text-sm leading-relaxed">{sec.body}</div>;
          case "richtext":
            return (
              <div key={sec.id} className="px-7 py-4">
                {sec.heading && <h2 className="text-lg font-bold text-slate-900 mb-2">{sec.heading}</h2>}
                <p className="text-sm text-slate-700 leading-relaxed">{sec.body}</p>
              </div>
            );
          case "image":
            return (
              <div key={sec.id} className="px-7 py-4">
                {sec.imageUrl && <img src={sec.imageUrl} alt={sec.imageAlt} className="w-full rounded-xl" />}
                {sec.imageCaption && <p className="text-center text-xs text-slate-500 mt-2 italic">{sec.imageCaption}</p>}
              </div>
            );
          case "quote":
            return (
              <blockquote key={sec.id} className="mx-7 my-4 border-l-4 border-amber-400 pl-4 py-1">
                <p className="text-sm font-medium italic text-slate-800">"{sec.quote}"</p>
                {sec.quoteAuthor && <cite className="text-xs text-slate-500 mt-1 block not-italic">— {sec.quoteAuthor}</cite>}
              </blockquote>
            );
          case "tips":
            return (
              <div key={sec.id} className="mx-7 my-4 bg-blue-50 rounded-xl p-5">
                {sec.heading && (
                  <p className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />{sec.heading}
                  </p>
                )}
                <ul className="space-y-2">
                  {(sec.tips ?? []).map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "faq":
            return (
              <div key={sec.id} className="px-7 py-4">
                <h3 className="text-base font-bold text-slate-900 mb-3">Frequently Asked Questions</h3>
                {(sec.faqs ?? []).map((f, i) => (
                  <details key={i} className="border border-slate-200 rounded-xl mb-2 px-4 py-3">
                    <summary className="font-semibold text-sm cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-sm text-slate-600">{f.a}</p>
                  </details>
                ))}
              </div>
            );
          case "cta":
            return (
              <div key={sec.id} className="mx-7 my-5 bg-primary rounded-2xl p-5 text-center text-white">
                <p className="text-base font-black">{sec.heading}</p>
                {sec.body && <p className="text-xs text-white/80 mt-1">{sec.body}</p>}
                <a href={sec.ctaUrl ?? "#"} className="mt-3 inline-block px-5 py-2 bg-white text-primary font-bold rounded-xl text-sm">
                  {sec.ctaText ?? "Book Now"}
                </a>
                {sec.ctaSubtext && <p className="text-[10px] text-white/60 mt-1.5">{sec.ctaSubtext}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
