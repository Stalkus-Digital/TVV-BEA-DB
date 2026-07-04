"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle, ArrowLeft, BarChart2, CheckCircle, ChevronRight,
  Eye, EyeOff, FileText, Globe, GripVertical, HelpCircle,
  Plus, Save, Search, Send, Upload, X
} from "lucide-react";

import {
  type Article, type ArticleSection, type EditorPanel, type SectionType,
  CATEGORIES, MOCK_ARTICLES, SECTION_TYPE_META,
  newArticle, newSection, seoScore, slugify,
} from "./guides-types";
import { ArticlePreview, F, SectionCard, SectionEditor, fi } from "./guides-sections";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function GuidesBuilder() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [editing, setEditing] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [panel, setPanel] = useState<EditorPanel>("content");
  const [preview, setPreview] = useState(false);
  const [newKw, setNewKw] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const ogFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (article: Article) => {
    setEditing(JSON.parse(JSON.stringify(article)));
    setActiveSectionId(article.sections[0]?.id ?? null);
    setPanel("content");
    setPreview(false);
    setAddingSection(false);
  };

  const saveArticle = useCallback((overrides?: Partial<Article>) => {
    setEditing(cur => {
      if (!cur) return null;
      const updated = { ...cur, ...overrides };
      setArticles(prev =>
        prev.find(a => a.id === updated.id)
          ? prev.map(a => a.id === updated.id ? updated : a)
          : [...prev, updated]
      );
      return null; // close editor
    });
  }, []);

  const updateEditing = useCallback(<K extends keyof Article>(key: K, val: Article[K]) => {
    setEditing(e => e ? { ...e, [key]: val } : null);
  }, []);

  const updateSeo = useCallback(<K extends keyof Article["seo"]>(key: K, val: Article["seo"][K]) => {
    setEditing(e => e ? { ...e, seo: { ...e.seo, [key]: val } } : null);
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<ArticleSection>) => {
    setEditing(e => e ? { ...e, sections: e.sections.map(s => s.id === id ? { ...s, ...patch } : s) } : null);
  }, []);

  const addSectionBlock = (type: SectionType) => {
    const sec = newSection(type);
    setEditing(e => e ? { ...e, sections: [...e.sections, sec] } : null);
    setActiveSectionId(sec.id);
    setAddingSection(false);
  };

  const removeSection = (id: string) => {
    setEditing(e => e ? { ...e, sections: e.sections.filter(s => s.id !== id) } : null);
    setActiveSectionId(null);
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setEditing(e => {
      if (!e) return null;
      const idx = e.sections.findIndex(s => s.id === id);
      const next = idx + dir;
      if (next < 0 || next >= e.sections.length) return e;
      const arr = [...e.sections];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return { ...e, sections: arr };
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guides & Blogs</h1>
            <p className="text-sm text-muted-foreground mt-1">Write, optimise, and publish travel guides with full SEO control.</p>
          </div>
          <button
            onClick={() => startEdit(newArticle())}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" /> New Article
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Articles", value: articles.length,                                          color: "text-blue-600 bg-blue-50",    Icon: FileText  },
            { label: "Published",      value: articles.filter(a => a.status === "published").length,    color: "text-emerald-600 bg-emerald-50", Icon: Globe  },
            { label: "Drafts",         value: articles.filter(a => a.status === "draft").length,        color: "text-amber-600 bg-amber-50",  Icon: FileText  },
            { label: "Total Views",    value: "8.2k",                                                   color: "text-violet-600 bg-violet-50", Icon: BarChart2 },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold">Article</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                  <th className="px-5 py-3.5 text-left font-semibold">SEO Score</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Read Time</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Date</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(article => {
                  const { score } = seoScore(article);
                  const sc = score >= 80 ? "text-emerald-600 bg-emerald-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
                  return (
                    <tr key={article.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={article.coverImage} alt="" className="w-12 h-9 object-cover rounded-md border border-border shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{article.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{article.seo.slug ? `/${article.seo.slug}` : "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded">{article.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${sc}`}>{score}%</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{article.readTime} min</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{article.publishDate}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${article.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {article.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => startEdit(article)} className="text-primary hover:underline font-semibold text-xs mr-3">Edit</button>
                        <button onClick={() => setArticles(prev => prev.filter(a => a.id !== article.id))} className="text-muted-foreground hover:text-destructive text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── EDITOR VIEW ────────────────────────────────────────────────────────────

  const activeSec = editing.sections.find(s => s.id === activeSectionId);
  const { score, checks } = seoScore(editing);
  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg   = score >= 80 ? "bg-emerald-500"  : score >= 50 ? "bg-amber-500"  : "bg-red-500";

  return (
    <div className="flex flex-col h-full -mx-6 -mt-6">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-border">|</span>
          <input
            value={editing.title}
            onChange={e => updateEditing("title", e.target.value)}
            className="text-sm font-semibold bg-transparent border-none outline-none text-foreground w-72 truncate"
            placeholder="Article title…"
          />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor} bg-muted`}>SEO {score}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${preview ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => saveArticle({ status: "draft" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-muted transition-colors"
          >
            <Save className="h-3.5 w-3.5" /> Save Draft
          </button>
          <button
            onClick={() => saveArticle({ status: "published" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Send className="h-3.5 w-3.5" /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Section Navigator ── */}
        <div className="w-52 border-r border-border bg-card shrink-0 flex flex-col overflow-hidden">
          <div className="flex border-b border-border">
            {(["content", "seo"] as EditorPanel[]).map(p => (
              <button key={p} onClick={() => setPanel(p)}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${panel === p ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}>
                {p === "seo" ? `SEO ${score}%` : "Sections"}
              </button>
            ))}
          </div>

          {panel === "content" ? (
            <>
              <div className="flex-1 overflow-y-auto py-1">
                {editing.sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => { setActiveSectionId(sec.id); setPanel("content"); }}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-border/50 group transition-colors ${activeSectionId === sec.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{sec.type}</p>
                      <p className="text-[11px] font-medium truncate">{sec.heading ?? sec.body?.slice(0, 28) ?? "—"}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                      <button onClick={e => { e.stopPropagation(); moveSection(sec.id, -1); }} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px] leading-none">▲</button>
                      <button onClick={e => { e.stopPropagation(); moveSection(sec.id, 1); }} disabled={idx === editing.sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px] leading-none">▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                {addingSection ? (
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1.5">Choose Block Type</p>
                    {SECTION_TYPE_META.map(({ type, label, desc }) => (
                      <button key={type} onClick={() => addSectionBlock(type)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-left transition-colors">
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold">{label}</p>
                          <p className="text-[9px] text-muted-foreground">{desc}</p>
                        </div>
                      </button>
                    ))}
                    <button onClick={() => setAddingSection(false)} className="w-full text-[10px] text-muted-foreground hover:text-foreground mt-1 text-center">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSection(true)} className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-border rounded-lg text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add Section
                  </button>
                )}
              </div>
            </>
          ) : (
            /* SEO Score Checklist */
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-center py-3">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-4 ${score >= 80 ? "border-emerald-500" : score >= 50 ? "border-amber-500" : "border-red-500"}`}>
                  <span className={`text-lg font-black ${scoreColor}`}>{score}</span>
                </div>
                <p className="text-xs font-semibold mt-1.5 text-muted-foreground">SEO Score</p>
              </div>
              <div className="space-y-1.5">
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {c.pass
                      ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      : <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                    <span className={`text-[11px] ${c.pass ? "text-foreground" : "text-muted-foreground"}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Canvas ── */}
        <div className="flex-1 overflow-auto bg-slate-100 p-5 flex justify-center">
          {preview ? (
            <ArticlePreview article={editing} />
          ) : (
            <div className="w-full max-w-2xl space-y-3">
              {/* Article Meta */}
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Article Settings</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Title</label>
                    <input
                      value={editing.title}
                      onChange={e => { updateEditing("title", e.target.value); if (!editing.seo.slug) updateSeo("slug", slugify(e.target.value)); }}
                      className={fi}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Author</label>
                    <input value={editing.author} onChange={e => updateEditing("author", e.target.value)} className={fi} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
                    <select value={editing.category} onChange={e => updateEditing("category", e.target.value)} className={fi}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Publish Date</label>
                    <input type="date" value={editing.publishDate} onChange={e => updateEditing("publishDate", e.target.value)} className={fi} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Read Time (min)</label>
                    <input type="number" value={editing.readTime} onChange={e => updateEditing("readTime", Number(e.target.value))} className={fi} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Excerpt</label>
                    <textarea value={editing.excerpt} onChange={e => updateEditing("excerpt", e.target.value)} rows={2} className={`${fi} resize-none`} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Cover Image URL</label>
                    <div className="flex gap-2">
                      <input value={editing.coverImage} onChange={e => updateEditing("coverImage", e.target.value)} className={`${fi} flex-1`} placeholder="https://…" />
                      <label className="cursor-pointer flex items-center gap-1 px-2 py-1.5 border border-border rounded-md text-xs text-muted-foreground hover:bg-muted">
                        <Upload className="h-3.5 w-3.5" />
                        <input ref={coverFileRef} type="file" accept="image/*" className="hidden"
                          onChange={async e => { const f = e.target.files?.[0]; if (f) updateEditing("coverImage", await readFileAsDataUrl(f)); }} />
                      </label>
                    </div>
                    {editing.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.coverImage} alt="" className="mt-2 w-full h-24 object-cover rounded-md border border-border" />
                    )}
                  </div>
                </div>
              </div>

              {/* Section cards */}
              {editing.sections.map(sec => (
                <SectionCard
                  key={sec.id}
                  sec={sec}
                  isActive={activeSectionId === sec.id}
                  onClick={() => { setActiveSectionId(sec.id); setPanel("content"); }}
                  onRemove={() => removeSection(sec.id)}
                />
              ))}

              <button
                onClick={() => setAddingSection(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Section
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Section Edit / SEO ── */}
        <div className="w-72 border-l border-border bg-card shrink-0 flex flex-col overflow-hidden">
          <div className="flex border-b border-border">
            {(["content", "seo"] as EditorPanel[]).map(p => (
              <button key={p} onClick={() => setPanel(p)}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${panel === p ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted"}`}>
                {p === "seo" ? "SEO & Meta" : "Section Edit"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* SECTION EDITOR */}
            {panel === "content" && activeSec && (
              <SectionEditor
                sec={activeSec}
                onUpdate={patch => updateSection(activeSec.id, patch)}
                readFileAsDataUrl={readFileAsDataUrl}
              />
            )}
            {panel === "content" && !activeSec && (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground gap-2">
                <HelpCircle className="h-8 w-8 opacity-20" />
                <p className="text-sm">Click a section in the canvas to edit it.</p>
              </div>
            )}

            {/* SEO EDITOR */}
            {panel === "seo" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className={`h-2.5 w-2.5 rounded-full ${scoreBg}`} />
                  <span className={`text-xs font-bold ${scoreColor}`}>SEO Score: {score}%</span>
                  <span className="text-xs text-muted-foreground ml-auto">{checks.filter(c => c.pass).length}/{checks.length} checks</span>
                </div>

                <F label="URL Slug *">
                  <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-md px-2 py-1.5 text-xs">
                    <span className="text-muted-foreground shrink-0">/guides/</span>
                    <input
                      value={editing.seo.slug}
                      onChange={e => updateSeo("slug", slugify(e.target.value))}
                      className="flex-1 bg-transparent outline-none text-foreground font-mono"
                      placeholder="your-slug-here"
                    />
                  </div>
                </F>

                <F label="Focus Keyword">
                  <input value={editing.seo.focusKeyword} onChange={e => updateSeo("focusKeyword", e.target.value)} className={fi} placeholder="e.g. things to do in Havelock" />
                </F>

                <F label="Secondary Keywords (Enter to add)">
                  <input
                    value={newKw}
                    onChange={e => setNewKw(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (newKw.trim()) { updateSeo("secondaryKeywords", [...editing.seo.secondaryKeywords, newKw.trim()]); setNewKw(""); } } }}
                    className={fi}
                    placeholder="Add keyword + Enter"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {editing.seo.secondaryKeywords.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {kw}
                        <button onClick={() => updateSeo("secondaryKeywords", editing.seo.secondaryKeywords.filter((_, j) => j !== i))}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </F>

                {/* SERP Preview */}
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Search className="h-3 w-3" /> SERP Preview
                  </p>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-0.5">
                    <p className="text-[11px] text-blue-600 font-medium leading-tight truncate">{editing.seo.metaTitle || editing.title || "Page Title"}</p>
                    <p className="text-[9px] text-green-700">thevacationvoice.in › guides › {editing.seo.slug || "slug"}</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">{editing.seo.metaDescription || "Meta description will appear here…"}</p>
                  </div>
                </div>

                <F label={`Meta Title (${editing.seo.metaTitle.length}/60)`}>
                  <input
                    value={editing.seo.metaTitle}
                    onChange={e => updateSeo("metaTitle", e.target.value)}
                    className={`${fi} ${editing.seo.metaTitle.length > 60 ? "border-red-400" : editing.seo.metaTitle.length >= 40 ? "border-emerald-400" : ""}`}
                    placeholder="Page title for Google…"
                  />
                  <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${editing.seo.metaTitle.length > 60 ? "bg-red-400" : editing.seo.metaTitle.length >= 40 ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(100, (editing.seo.metaTitle.length / 60) * 100)}%` }}
                    />
                  </div>
                </F>

                <F label={`Meta Description (${editing.seo.metaDescription.length}/160)`}>
                  <textarea
                    value={editing.seo.metaDescription}
                    onChange={e => updateSeo("metaDescription", e.target.value)}
                    rows={3}
                    className={`${fi} resize-none ${editing.seo.metaDescription.length > 160 ? "border-red-400" : editing.seo.metaDescription.length >= 120 ? "border-emerald-400" : ""}`}
                    placeholder="Compelling search result description…"
                  />
                  <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${editing.seo.metaDescription.length > 160 ? "bg-red-400" : editing.seo.metaDescription.length >= 120 ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(100, (editing.seo.metaDescription.length / 160) * 100)}%` }}
                    />
                  </div>
                </F>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Open Graph
                  </p>
                </div>

                <F label="OG Title"><input value={editing.seo.ogTitle} onChange={e => updateSeo("ogTitle", e.target.value)} className={fi} placeholder="Social share title…" /></F>
                <F label="OG Description"><textarea value={editing.seo.ogDescription} onChange={e => updateSeo("ogDescription", e.target.value)} rows={2} className={`${fi} resize-none`} /></F>
                <F label="OG Image URL">
                  <div className="flex gap-2">
                    <input value={editing.seo.ogImage} onChange={e => updateSeo("ogImage", e.target.value)} className={`${fi} flex-1`} placeholder="https://…" />
                    <label className="cursor-pointer flex items-center px-2 border border-border rounded-md text-muted-foreground hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      <input ref={ogFileRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { const f = e.target.files?.[0]; if (f) updateSeo("ogImage", await readFileAsDataUrl(f)); }} />
                    </label>
                  </div>
                  {editing.seo.ogImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editing.seo.ogImage} alt="" className="mt-1.5 w-full h-16 object-cover rounded-md border border-border" />
                  )}
                </F>

                <F label="Canonical URL"><input value={editing.seo.canonicalUrl} onChange={e => updateSeo("canonicalUrl", e.target.value)} className={fi} placeholder="https://…" /></F>

                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Advanced</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.seo.noIndex} onChange={e => updateSeo("noIndex", e.target.checked)} className="rounded border-border" />
                    <span className="text-xs font-medium text-foreground">No-index (hide from Google)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.seo.articleSchema} onChange={e => updateSeo("articleSchema", e.target.checked)} className="rounded border-border" />
                    <span className="text-xs font-medium text-foreground">Article JSON-LD Schema</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
