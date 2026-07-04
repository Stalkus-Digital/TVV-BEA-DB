"use client";

import { useState, useCallback, useRef } from "react";
import {
  Monitor, Smartphone, Tablet, Download, Eye, Plus,
  RefreshCw, ChevronDown, ChevronRight, Image as ImageIcon,
  Settings2, Package, LayoutTemplate, HelpCircle, Globe, Star,
  CheckCircle, X, Upload, FileCode, FileText
} from "lucide-react";
import {
  type LandingPageData,
  type PackageCard,
  type CarouselCategory,
  type TrustStat,
  type WhyCard,
  type FaqItem,
  generatePhpContent,
  generateHtmlContent,
} from "@/lib/template-generator";

// ─── TYPES (local only) ───────────────────────────────────────────────────────

type SectionKey = "page" | "header" | "hero" | "packages" | "why" | "faq";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Constructs the backgroundImage style object at runtime — no static url() literal
// exists in the source that Tailwind v4's content scanner can pick up.
const makeBgStyle = (src: string): React.CSSProperties => ({
  backgroundImage: ["url(", JSON.stringify(src), ")"].join(""),
  backgroundSize: "cover",
  backgroundPosition: "center",
});

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CAT_KEYS: CarouselCategory[] = ["deals", "family", "group", "treks"];

const DEFAULT_DATA: LandingPageData = {
  pageTitle: "Ladakh Tour Packages Starting ₹18,999 | Limited Slots 2026 — The Vacation Voice",
  metaDescription: "All-inclusive Ladakh trips with stays, transport & local support. Starting ₹18,999/person.",
  destination: "ladakh",
  pixelId: "1226523166034677",
  logoUrl: "https://thevacationvoice.in/wp-content/uploads/2025/09/Logo_Standard-CjEDHebT-2.png.webp",
  waNumber: "916297919122",
  callNumber: "+916297919122",
  heroImage: "https://images.unsplash.com/photo-1619837374214-f5b9eb80876d?w=1920&q=80&auto=format&fit=crop",
  heroBadge: "Leh Ladakh",
  heroHeadline: "Ladakh Tour Packages\nStarting ₹18,999",
  heroSubheadline: "All-inclusive Ladakh trips with stays, transport & local support. Get your custom itinerary in 10 minutes.",
  heroSlotYear: "2026",
  trustStats: [
    { icon: "users", value: "500+", label: "Happy Travelers" },
    { icon: "star", value: "4.8 ★", label: "Avg. Rating" },
    { icon: "check", value: "0", label: "Hidden Costs" },
    { icon: "map", value: "Local", label: "Ladakh Experts" },
  ],
  categoryLabels: [
    { key: "deals", label: "Featured Deals" },
    { key: "family", label: "Family Tours" },
    { key: "group", label: "Group Tours" },
    { key: "treks", label: "Treks & Adventures" },
  ],
  packages: [
    { id: "lp-1", category: "deals", title: "Classic Leh-Ladakh Explorer", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80", duration: "5N/6D", price: 18999, badge: "Bestseller", highlights: ["Pangong Tso", "Nubra Valley", "Magnetic Hill"], fromCatalogue: false },
    { id: "lp-2", category: "deals", title: "Leh-Nubra-Pangong Circuit", image: "https://images.unsplash.com/photo-1580469361954-7f16571b6185?w=600&q=80", duration: "6N/7D", price: 24999, badge: "Popular", highlights: ["Sand Dunes", "Diskit Monastery", "Bactrian Camels"], fromCatalogue: false },
    { id: "lp-3", category: "family", title: "Leh Family Retreat", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", duration: "5N/6D", price: 21999, badge: "Family Special", highlights: ["Kid-friendly stays", "Easy terrain", "Local cuisine"], fromCatalogue: false },
    { id: "lp-4", category: "group", title: "Ladakh Group Expedition", image: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=600&q=80", duration: "7N/8D", price: 19999, badge: "Group Deal", highlights: ["Leader-guided", "Camping", "Bonfire nights"], fromCatalogue: false },
    { id: "lp-5", category: "treks", title: "Markha Valley Trek", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80", duration: "6N/7D", price: 22999, badge: "Adventure", highlights: ["High altitude trek", "Hemis National Park", "Village homestays"], fromCatalogue: false },
  ],
  whyTitle: "Crafting Memories in the Mountains",
  whySubtitle: "We don't just book hotels; we curate high-altitude adventures with extreme safety.",
  whyCards: [
    { icon: "map", title: "End-to-End Planning", description: "From permits to flights, we handle everything." },
    { icon: "star", title: "Verified Stays", description: "Handpicked luxury tents and boutique hotels." },
    { icon: "check", title: "Zero Hidden Costs", description: "Complete transparency in pricing always." },
    { icon: "users", title: "Local Expertise", description: "Our guides are born and raised in Ladakh." },
    { icon: "shield", title: "24/7 Support", description: "We are with you before, during, and after the trip." },
  ],
  faqs: [
    { id: "f1", question: "What is the best time to visit Ladakh?", answer: "The best time is June to September when roads are open and weather is pleasant." },
    { id: "f2", question: "Is altitude sickness a concern?", answer: "Yes. We recommend 1-2 days of acclimatization in Leh before venturing to high passes." },
    { id: "f3", question: "Are flights included in the package?", answer: "Flights can be added on request. Call us for a custom quote." },
    { id: "f4", question: "How is the internet connectivity in Ladakh?", answer: "BSNL and Jio cover most areas. Nubra and Pangong may have limited connectivity." },
  ],
};

const CATALOGUE_PACKAGES = [
  { id: "PKG-001", title: "Premium Andaman Escape", destination: "Andaman", duration: "5D/4N", price: 45000 },
  { id: "PKG-002", title: "Maldives Honeymoon Special", destination: "Maldives", duration: "6D/5N", price: 125000 },
  { id: "PKG-003", title: "Bali Retreat", destination: "Bali", duration: "7D/6N", price: 75000 },
  { id: "PKG-004", title: "Dubai Shopping Fest", destination: "Dubai", duration: "4D/3N", price: 55000 },
  { id: "PKG-005", title: "Kerala Backwaters", destination: "Kerala", duration: "5D/4N", price: 32000 },
];

const SECTION_LABELS: Record<SectionKey, { label: string; icon: any }> = {
  page:     { label: "Page Settings",   icon: Globe },
  header:   { label: "Header & Logo",   icon: LayoutTemplate },
  hero:     { label: "Hero Section",    icon: ImageIcon },
  packages: { label: "Packages",        icon: Package },
  why:      { label: "Why Choose Us",   icon: Star },
  faq:      { label: "FAQs",            icon: HelpCircle },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function LandingPageBuilder() {
  const [data, setData] = useState<LandingPageData>(DEFAULT_DATA);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [packageTab, setPackageTab] = useState<"manage" | "sync" | "add">("manage");
  const [newPkg, setNewPkg] = useState<Partial<PackageCard>>({ category: "deals", highlights: [] });
  const [newHighlight, setNewHighlight] = useState("");
  const [expandedPkgs, setExpandedPkgs] = useState(true);
  const [exportFormat, setExportFormat] = useState<"php" | "html">("php");
  const [heroImgMode, setHeroImgMode] = useState<"url" | "upload">("url");
  const [pkgImgMode, setPkgImgMode] = useState<"url" | "upload">("url");
  const heroFileRef = useRef<HTMLInputElement>(null);
  const pkgFileRef = useRef<HTMLInputElement>(null);

  const update = useCallback(<K extends keyof LandingPageData>(key: K, val: LandingPageData[K]) => {
    setData(d => ({ ...d, [key]: val }));
  }, []);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update("heroImage", await readFileAsDataUrl(file));
  };

  const handlePkgImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPkg(p => ({ ...p, image: "" })); // clear first
    const url = await readFileAsDataUrl(file);
    setNewPkg(p => ({ ...p, image: url }));
  };

  const updateStat = (i: number, field: keyof TrustStat, val: string) => {
    const next = [...data.trustStats];
    next[i] = { ...next[i], [field]: val };
    update("trustStats", next);
  };

  const updateCatLabel = (key: CarouselCategory, label: string) => {
    update("categoryLabels", data.categoryLabels.map(c => c.key === key ? { ...c, label } : c));
  };

  const updateWhyCard = (i: number, field: keyof WhyCard, val: string) => {
    const next = [...data.whyCards];
    next[i] = { ...next[i], [field]: val };
    update("whyCards", next);
  };

  const updateFaq = (i: number, field: keyof FaqItem, val: string) => {
    const next = [...data.faqs];
    next[i] = { ...next[i], [field]: val };
    update("faqs", next);
  };

  const addFaq = () =>
    update("faqs", [...data.faqs, { id: `f${Date.now()}`, question: "New question?", answer: "Answer here." }]);

  const removeFaq = (id: string) => update("faqs", data.faqs.filter(f => f.id !== id));

  const removePackage = (id: string) => update("packages", data.packages.filter(p => p.id !== id));

  const updatePackageCat = (id: string, category: CarouselCategory) =>
    update("packages", data.packages.map(p => p.id === id ? { ...p, category } : p));

  const syncFromCatalogue = (cat: typeof CATALOGUE_PACKAGES[0]) => {
    if (data.packages.some(p => p.catalogueId === cat.id)) return;
    update("packages", [...data.packages, {
      id: `cat-${cat.id}`,
      catalogueId: cat.id,
      category: "deals" as CarouselCategory,
      title: cat.title,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      duration: cat.duration,
      price: cat.price,
      badge: "",
      highlights: [cat.destination],
      fromCatalogue: true,
    }]);
  };

  const addCustomPackage = () => {
    if (!newPkg.title || !newPkg.price) return;
    update("packages", [...data.packages, {
      id: `custom-${Date.now()}`,
      category: newPkg.category ?? "deals",
      title: newPkg.title ?? "",
      image: newPkg.image ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      duration: newPkg.duration ?? "5D/4N",
      price: Number(newPkg.price),
      badge: newPkg.badge ?? "",
      highlights: newPkg.highlights ?? [],
      fromCatalogue: false,
    }]);
    setNewPkg({ category: "deals", highlights: [] });
    setNewHighlight("");
    setPackageTab("manage");
  };

  const doExport = () => {
    const isPhp = exportFormat === "php";
    const content = isPhp ? generatePhpContent(data) : generateHtmlContent(data);
    const blob = new Blob([content], { type: isPhp ? "application/x-httpd-php" : "text/html" });
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = `${data.destination}-landing.${isPhp ? "php" : "html"}`;
    a.click();
    URL.revokeObjectURL(objUrl);
  };

  const pkgsByCat = (cat: CarouselCategory) => data.packages.filter(p => p.category === cat);
  const catLabel = (key: CarouselCategory) => data.categoryLabels.find(c => c.key === key)?.label ?? key;
  const previewWidth = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  return (
    <div className="flex h-full bg-background border border-border rounded-lg overflow-hidden shadow-sm text-sm">

      {/* ── LEFT PANEL ── */}
      <div className="w-56 border-r border-border bg-card shrink-0 flex flex-col">
        <div className="p-3 border-b border-border">
          <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Template Sections</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {(Object.keys(SECTION_LABELS) as SectionKey[]).map(key => {
            const { label, icon: Icon } = SECTION_LABELS[key];
            const isActive = activeSection === key;
            const hasSub = key === "packages";
            return (
              <div key={key}>
                <button
                  onClick={() => { setActiveSection(key); if (hasSub) setExpandedPkgs(e => !e); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-xs font-medium">{label}</span>
                  {hasSub && (expandedPkgs ? <ChevronDown className="h-3 w-3 opacity-60" /> : <ChevronRight className="h-3 w-3 opacity-60" />)}
                </button>
                {hasSub && expandedPkgs && (
                  <div className="pl-4 pb-1">
                    {CAT_KEYS.map(cat => (
                      <div key={cat} className="flex items-center justify-between px-3 py-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{catLabel(cat)}</span>
                        <span className="font-bold text-primary ml-1">{pkgsByCat(cat).length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Export Controls */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex border border-border rounded-md overflow-hidden">
            {(["php", "html"] as const).map(fmt => (
              <button key={fmt} onClick={() => setExportFormat(fmt)}
                className={`flex-1 py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${exportFormat === fmt ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                {fmt === "php" ? <FileCode className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={doExport} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary-hover transition-colors shadow-sm">
            <Download className="h-3.5 w-3.5" /> Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      {/* ── CENTER: LIVE PREVIEW ── */}
      <div className="flex-1 flex flex-col bg-slate-100 min-w-0 overflow-hidden">
        <div className="h-11 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md border border-border">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setViewport(v)}
                className={`p-1.5 rounded transition-all ${viewport === v ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{data.destination} Landing Page</span>
          <button onClick={doExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors">
            <Download className="h-3.5 w-3.5" /> Export {exportFormat.toUpperCase()}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <div className="bg-white shadow-xl rounded-sm border border-slate-200 overflow-hidden transition-all duration-300"
            style={{ width: previewWidth, minWidth: viewport === "mobile" ? "375px" : "auto", maxWidth: "100%" }}>

            {/* HEADER */}
            <Section sKey="header" active={activeSection} onClick={() => setActiveSection("header")}>
              <div className="h-13 border-b border-slate-100 flex items-center justify-between px-6 py-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logoUrl} alt="Logo" className="h-7 w-auto object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
                <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>Home</span><span>Packages</span><span>Why Us</span><span>FAQs</span>
                  <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">Submit Enquiry</span>
                </div>
              </div>
            </Section>

            {/* HERO */}
            <Section sKey="hero" active={activeSection} onClick={() => setActiveSection("hero")}>
              <div className="relative min-h-72 flex" style={makeBgStyle(data.heroImage)}>
                <div className="absolute inset-0 bg-slate-900/50" />
                <div className="relative z-10 grid md:grid-cols-2 gap-5 p-5 w-full items-start">
                  <div className="text-white">
                    <span className="inline-block bg-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-medium mb-2">{data.heroBadge}</span>
                    <h1 className="text-xl font-extrabold leading-tight">
                      {data.heroHeadline.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                      <span className="text-amber-300">Limited Slots {data.heroSlotYear}</span>
                    </h1>
                    <p className="mt-1.5 text-[11px] text-white/80 leading-relaxed">{data.heroSubheadline}</p>
                    <div className="mt-2.5 flex gap-2 flex-wrap">
                      <span className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg">WhatsApp Itinerary</span>
                      <span className="px-3 py-1.5 bg-white/20 border border-white/30 text-white text-[10px] font-bold rounded-lg">Call Now</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {data.trustStats.map((s, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center border border-white/10">
                          <div className="text-xs font-bold text-white">{s.value}</div>
                          <div className="text-[9px] text-white/60 uppercase tracking-wider">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-xl">
                    <p className="text-xs font-bold text-slate-900 text-center mb-2">Please submit your info</p>
                    {["Full name", "Email", "Phone"].map(f => (
                      <div key={f} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-400 mb-1.5">{f}</div>
                    ))}
                    <div className="w-full rounded-lg bg-slate-900 text-white text-[10px] font-bold py-2 text-center">Next →</div>
                  </div>
                </div>
              </div>
            </Section>

            {/* PACKAGES */}
            <Section sKey="packages" active={activeSection} onClick={() => setActiveSection("packages")}>
              <div className="bg-slate-50 px-5 py-7">
                <div className="text-center mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Curated with expertise</p>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Best Deals</h2>
                </div>
                {CAT_KEYS.map(cat => {
                  const pkgs = pkgsByCat(cat);
                  if (!pkgs.length) return null;
                  return (
                    <div key={cat} className="mb-6">
                      <p className="text-xs font-semibold text-slate-800 mb-2">{catLabel(cat)}</p>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {pkgs.map(pkg => (
                          <div key={pkg.id} className="shrink-0 w-44 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="h-24 relative overflow-hidden bg-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                              {pkg.badge && <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pkg.badge}</span>}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">{pkg.title}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] text-slate-500">{pkg.duration}</span>
                                <span className="text-[11px] font-bold text-blue-600">₹{pkg.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* WHY CHOOSE */}
            <Section sKey="why" active={activeSection} onClick={() => setActiveSection("why")}>
              <div className="bg-blue-50 px-5 py-7">
                <h2 className="text-sm font-semibold text-slate-900 text-center">{data.whyTitle}</h2>
                <p className="text-[10px] text-slate-600 text-center mt-0.5">{data.whySubtitle}</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                  {data.whyCards.map((c, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border-b-4 border-amber-700">
                      <p className="text-[11px] font-semibold text-slate-800">{c.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* FAQ */}
            <Section sKey="faq" active={activeSection} onClick={() => setActiveSection("faq")}>
              <div className="px-5 py-7 bg-white">
                <h2 className="text-sm font-semibold text-slate-900 text-center mb-4">Frequently Asked Questions</h2>
                {data.faqs.map(faq => (
                  <div key={faq.id} className="border border-slate-200 rounded-lg px-4 py-2.5 mb-2">
                    <p className="text-[11px] font-semibold text-slate-800">{faq.question}</p>
                    <p className="text-[9px] text-slate-500 mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: SECTION EDITORS ── */}
      <div className="w-72 border-l border-border bg-card shrink-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-xs uppercase tracking-wider">{SECTION_LABELS[activeSection].label}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* PAGE SETTINGS */}
          {activeSection === "page" && <>
            <F label="Page Title"><input value={data.pageTitle} onChange={e => update("pageTitle", e.target.value)} className={fc} /></F>
            <F label="Meta Description"><textarea value={data.metaDescription} onChange={e => update("metaDescription", e.target.value)} rows={3} className={`${fc} resize-none`} /></F>
            <F label="Destination Slug (e.g. ladakh)"><input value={data.destination} onChange={e => update("destination", e.target.value)} className={fc} /></F>
            <F label="Meta Pixel ID"><input value={data.pixelId} onChange={e => update("pixelId", e.target.value)} className={fc} /></F>
          </>}

          {/* HEADER */}
          {activeSection === "header" && <>
            <ImgField label="Logo Image" mode={heroImgMode} setMode={setHeroImgMode}
              url={data.logoUrl} onUrl={v => update("logoUrl", v)}
              fileRef={heroFileRef} onFileChange={handleHeroUpload} showPreview={false} />
            <F label="WhatsApp Number (country code, no +)"><input value={data.waNumber} onChange={e => update("waNumber", e.target.value)} className={fc} placeholder="916297919122" /></F>
            <F label="Call Number"><input value={data.callNumber} onChange={e => update("callNumber", e.target.value)} className={fc} /></F>
          </>}

          {/* HERO */}
          {activeSection === "hero" && <>
            <ImgField label="Background Image" mode={heroImgMode} setMode={setHeroImgMode}
              url={data.heroImage} onUrl={v => update("heroImage", v)}
              fileRef={heroFileRef} onFileChange={handleHeroUpload} showPreview />
            <F label="Badge Text"><input value={data.heroBadge} onChange={e => update("heroBadge", e.target.value)} className={fc} /></F>
            <F label="Headline (Enter = new line)"><textarea value={data.heroHeadline} onChange={e => update("heroHeadline", e.target.value)} rows={2} className={`${fc} resize-none`} /></F>
            <F label="Sub-headline"><textarea value={data.heroSubheadline} onChange={e => update("heroSubheadline", e.target.value)} rows={3} className={`${fc} resize-none`} /></F>
            <F label="Slot Year"><input value={data.heroSlotYear} onChange={e => update("heroSlotYear", e.target.value)} className={fc} /></F>
            <div className="border-t border-border pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Trust Badges</p>
              {data.trustStats.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-1.5 mb-1.5">
                  <input value={s.value} onChange={e => updateStat(i, "value", e.target.value)} className={fc} placeholder="Value" />
                  <input value={s.label} onChange={e => updateStat(i, "label", e.target.value)} className={fc} placeholder="Label" />
                </div>
              ))}
            </div>
          </>}

          {/* PACKAGES */}
          {activeSection === "packages" && <>
            {/* Editable category names */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">Carousel Category Names</p>
              {CAT_KEYS.map(cat => (
                <div key={cat} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] text-muted-foreground w-10 shrink-0 uppercase font-bold">{cat}</span>
                  <input value={catLabel(cat)} onChange={e => updateCatLabel(cat, e.target.value)} className={`${fc} flex-1`} />
                </div>
              ))}
            </div>

            {/* Sub-tabs */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              {(["manage", "sync", "add"] as const).map(t => (
                <button key={t} onClick={() => setPackageTab(t)}
                  className={`flex-1 py-1.5 text-[10px] font-bold transition-colors ${packageTab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                  {t === "sync" ? "Sync" : t === "add" ? "+ Custom" : "Manage"}
                </button>
              ))}
            </div>

            {/* MANAGE */}
            {packageTab === "manage" && (
              <div className="space-y-3">
                {CAT_KEYS.map(cat => {
                  const pkgs = pkgsByCat(cat);
                  return (
                    <div key={cat}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{catLabel(cat)} ({pkgs.length})</p>
                      {pkgs.length === 0 && <p className="text-[10px] text-muted-foreground italic px-1 mb-1">No packages yet.</p>}
                      {pkgs.map(pkg => (
                        <div key={pkg.id} className="flex items-start gap-2 bg-muted/30 rounded-lg p-2 border border-border mb-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pkg.image} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-foreground truncate">{pkg.title}</p>
                            <p className="text-[9px] text-muted-foreground">{pkg.duration} · ₹{pkg.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <select value={pkg.category} onChange={e => updatePackageCat(pkg.id, e.target.value as CarouselCategory)}
                                className="text-[9px] border border-border rounded px-1 py-0.5 bg-background">
                                {CAT_KEYS.map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
                              </select>
                              {pkg.fromCatalogue && <span className="text-[8px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">SYNCED</span>}
                            </div>
                          </div>
                          <button onClick={() => removePackage(pkg.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* SYNC FROM CATALOGUE */}
            {packageTab === "sync" && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">Add packages from your portal catalogue to this landing page.</p>
                {CATALOGUE_PACKAGES.map(cat => {
                  const synced = data.packages.some(p => p.catalogueId === cat.id);
                  return (
                    <div key={cat.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5 border border-border">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-[11px] font-semibold text-foreground truncate">{cat.title}</p>
                        <p className="text-[9px] text-muted-foreground">{cat.destination} · {cat.duration} · ₹{cat.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => syncFromCatalogue(cat)} disabled={synced}
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded-md transition-colors ${synced ? "bg-emerald-50 text-emerald-700 cursor-default" : "bg-primary text-primary-foreground hover:bg-primary-hover"}`}>
                        {synced ? <><CheckCircle className="h-3 w-3" /> Synced</> : <><RefreshCw className="h-3 w-3" /> Sync</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ADD CUSTOM */}
            {packageTab === "add" && (
              <div className="space-y-2.5">
                <F label="Carousel Category">
                  <select value={newPkg.category} onChange={e => setNewPkg(p => ({ ...p, category: e.target.value as CarouselCategory }))} className={fc}>
                    {CAT_KEYS.map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
                  </select>
                </F>
                <F label="Package Title *"><input value={newPkg.title ?? ""} onChange={e => setNewPkg(p => ({ ...p, title: e.target.value }))} className={fc} /></F>
                <ImgField label="Package Image" mode={pkgImgMode} setMode={setPkgImgMode}
                  url={newPkg.image ?? ""} onUrl={v => setNewPkg(p => ({ ...p, image: v }))}
                  fileRef={pkgFileRef} onFileChange={handlePkgImgUpload} showPreview />
                <div className="grid grid-cols-2 gap-2">
                  <F label="Duration"><input value={newPkg.duration ?? ""} onChange={e => setNewPkg(p => ({ ...p, duration: e.target.value }))} className={fc} placeholder="5D/4N" /></F>
                  <F label="Price (₹) *"><input type="number" value={newPkg.price ?? ""} onChange={e => setNewPkg(p => ({ ...p, price: Number(e.target.value) }))} className={fc} placeholder="18999" /></F>
                </div>
                <F label="Badge (optional)"><input value={newPkg.badge ?? ""} onChange={e => setNewPkg(p => ({ ...p, badge: e.target.value }))} className={fc} placeholder="Bestseller" /></F>
                <F label="Highlights (Enter to add)">
                  <input value={newHighlight} onChange={e => setNewHighlight(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (newHighlight.trim()) { setNewPkg(p => ({ ...p, highlights: [...(p.highlights ?? []), newHighlight.trim()] })); setNewHighlight(""); } } }}
                    className={fc} placeholder="e.g. Pangong Tso" />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(newPkg.highlights ?? []).map((h, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {h}<button onClick={() => setNewPkg(p => ({ ...p, highlights: p.highlights?.filter((_, j) => j !== i) }))}><X className="h-2.5 w-2.5" /></button>
                      </span>
                    ))}
                  </div>
                </F>
                <button onClick={addCustomPackage} disabled={!newPkg.title || !newPkg.price}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="h-3.5 w-3.5" /> Add Package to Page
                </button>
              </div>
            )}
          </>}

          {/* WHY CHOOSE */}
          {activeSection === "why" && <>
            <F label="Section Title"><input value={data.whyTitle} onChange={e => update("whyTitle", e.target.value)} className={fc} /></F>
            <F label="Section Sub-title"><input value={data.whySubtitle} onChange={e => update("whySubtitle", e.target.value)} className={fc} /></F>
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feature Cards</p>
              {data.whyCards.map((c, i) => (
                <div key={i} className="bg-muted/30 border border-border rounded-lg p-2.5 space-y-1.5">
                  <F label={`Card ${i + 1} Title`}><input value={c.title} onChange={e => updateWhyCard(i, "title", e.target.value)} className={fc} /></F>
                  <F label="Description"><input value={c.description} onChange={e => updateWhyCard(i, "description", e.target.value)} className={fc} /></F>
                </div>
              ))}
            </div>
          </>}

          {/* FAQ */}
          {activeSection === "faq" && <>
            {data.faqs.map((fq, i) => (
              <div key={fq.id} className="bg-muted/30 border border-border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Q{i + 1}</span>
                  <button onClick={() => removeFaq(fq.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                </div>
                <F label="Question"><input value={fq.question} onChange={e => updateFaq(i, "question", e.target.value)} className={fc} /></F>
                <F label="Answer"><textarea value={fq.answer} onChange={e => updateFaq(i, "answer", e.target.value)} rows={3} className={`${fc} resize-none`} /></F>
              </div>
            ))}
            <button onClick={addFaq} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-border rounded-lg text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Question
            </button>
          </>}

        </div>
      </div>
    </div>
  );
}

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

const fc = "w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ImgField({ label, mode, setMode, url, onUrl, fileRef, onFileChange, showPreview }: {
  label: string; mode: "url" | "upload"; setMode: (m: "url" | "upload") => void;
  url: string; onUrl: (v: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPreview?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <div className="flex border border-border rounded overflow-hidden">
          {(["url", "upload"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-[9px] font-bold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {m === "url" ? "URL" : "Upload"}
            </button>
          ))}
        </div>
      </div>
      {mode === "url"
        ? <input value={url} onChange={e => onUrl(e.target.value)} className={fc} placeholder="https://..." />
        : (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3 cursor-pointer hover:border-primary transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Click to upload image</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
        )}
      {showPreview && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-1.5 w-full h-20 object-cover rounded-md border border-border" />
      )}
    </div>
  );
}

function Section({ sKey, active, onClick, children }: {
  sKey: SectionKey; active: SectionKey; onClick: () => void; children: React.ReactNode;
}) {
  const isActive = active === sKey;
  return (
    <div onClick={onClick} className={`relative cursor-pointer transition-all ${isActive ? "ring-2 ring-primary ring-inset" : "hover:ring-2 hover:ring-primary/40 ring-inset"}`}>
      {isActive && (
        <div className="absolute top-1.5 right-1.5 z-20 bg-primary text-primary-foreground text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
          {SECTION_LABELS[sKey].label}
        </div>
      )}
      {children}
    </div>
  );
}
