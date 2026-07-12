"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Trash2 } from "lucide-react";
import { usePackagesQuery } from "@/features/admin-packages/hooks/usePackagesQuery";

interface LandingPageEditorProps {
  onCancel: () => void;
}

export function LandingPageEditor({ onCancel }: LandingPageEditorProps) {
  const queryClient = useQueryClient();
  const packagesQuery = usePackagesQuery({});
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [slotYear, setSlotYear] = useState(new Date().getFullYear().toString());
  const [trustBadges, setTrustBadges] = useState("");
  
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [faqSection, setFaqSection] = useState<{ question: string; answer: string }[]>([]);
  
  const [draggedFaqIndex, setDraggedFaqIndex] = useState<number | null>(null);
  const [draggedPkgId, setDraggedPkgId] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);

  function togglePackage(id: string) {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handlePackageDragStart(id: string) {
    setDraggedPkgId(id);
  }

  function handlePackageDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (!draggedPkgId || draggedPkgId === id) return;
    const items = [...selectedPackages];
    const draggedIdx = items.indexOf(draggedPkgId);
    const targetIdx = items.indexOf(id);
    if (draggedIdx === -1 || targetIdx === -1) return;
    items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedPkgId);
    setSelectedPackages(items);
  }

  function handlePackageDragEnd() {
    setDraggedPkgId(null);
  }

  function addFaq() {
    setFaqSection([...faqSection, { question: "", answer: "" }]);
  }

  function updateFaq(index: number, field: "question" | "answer", value: string) {
    const newFaqs = [...faqSection];
    newFaqs[index][field] = value;
    setFaqSection(newFaqs);
  }

  function removeFaq(index: number) {
    setFaqSection(faqSection.filter((_, i) => i !== index));
  }

  function handleFaqDragStart(index: number) {
    setDraggedFaqIndex(index);
  }

  function handleFaqDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedFaqIndex === null || draggedFaqIndex === index) return;
    const newFaqs = [...faqSection];
    const draggedItem = newFaqs[draggedFaqIndex];
    newFaqs.splice(draggedFaqIndex, 1);
    newFaqs.splice(index, 0, draggedItem);
    setDraggedFaqIndex(index);
    setFaqSection(newFaqs);
  }

  function handleFaqDragEnd() {
    setDraggedFaqIndex(null);
  }

  async function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // For now, since there's no dedicated media upload endpoint, 
    // we use a FileReader to base64 encode it so it shows instantly in the preview/HTML.
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setHeroImage(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          heroSection: {
            headline: heroHeadline,
            subheadline: heroSubheadline,
            backgroundImage: heroImage,
            badgeText,
            slotYear,
            trustBadges: trustBadges.split(",").map((b) => b.trim()).filter(Boolean),
          },
          packages: selectedPackages,
          faqSection,
        }),
      });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["admin", "landing-pages"] });
        onCancel();
      } else {
        alert("Failed to save landing page");
      }
    } catch (error) {
      alert("Error saving landing page");
    } finally {
      setIsSaving(false);
    }
  }

  function generateHtml() {
    // Get full package objects for selected packages so we can render them in HTML
    const allPackages = packagesQuery.data?.items ?? [];
    const selectedPkgObjects = allPackages.filter((p) => selectedPackages.includes(p.id));
    const badges = trustBadges.split(",").map((b) => b.trim()).filter(Boolean);

    // Build packages HTML — fully rendered, no JS needed
    const packagesHtml = selectedPkgObjects.length > 0
      ? selectedPkgObjects.map((pkg) => `
        <div class="pkg-card">
          <div class="pkg-body">
            <h3 class="pkg-title">${pkg.title}</h3>
            <p class="pkg-meta">${pkg.durationDays} Days&nbsp;/&nbsp;${pkg.durationNights ?? pkg.durationDays - 1} Nights</p>
            <a href="#enquire" class="pkg-cta">Enquire Now</a>
          </div>
        </div>`).join("")
      : "<p class=\"no-packages\">Packages coming soon — contact us for exclusive deals.</p>";

    // Build FAQ HTML — semantic details/summary accordion, no JS
    const faqHtml = faqSection.length > 0
      ? faqSection.map((f) => `
        <details class="faq-item">
          <summary class="faq-question">${f.question}</summary>
          <p class="faq-answer">${f.answer}</p>
        </details>`).join("")
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${heroSubheadline || title}">
  <title>${title || "Landing Page"}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #1f2937; }
    a { color: inherit; }

    /* ── Hero ── */
    .hero {
      position: relative;
      min-height: 540px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 80px 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      ${heroImage ? `background: url('${heroImage}') center/cover no-repeat;` : ""}
      color: #fff;
    }
    .hero::before {
      content: ""; position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
    }
    .hero > * { position: relative; z-index: 1; }
    .badge {
      display: inline-block; background: #3b82f6; color: #fff;
      padding: 4px 16px; border-radius: 99px; font-size: 0.85rem;
      font-weight: 700; letter-spacing: 0.5px; margin-bottom: 20px;
    }
    .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0 0 16px; line-height: 1.15; max-width: 800px; }
    .hero p { font-size: 1.15rem; max-width: 600px; margin: 0 auto 10px; opacity: 0.9; }
    .hero .season { font-size: 0.85rem; opacity: 0.7; margin-top: 8px; }
    .trust-badges { margin-top: 32px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
    .trust-badge {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      padding: 8px 18px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .hero-cta {
      display: inline-block; margin-top: 36px;
      background: #3b82f6; color: #fff; text-decoration: none;
      padding: 14px 36px; border-radius: 8px; font-size: 1rem; font-weight: 700;
      transition: background 0.2s;
    }
    .hero-cta:hover { background: #2563eb; }

    /* ── Section wrapper ── */
    .section { max-width: 1100px; margin: 0 auto; padding: 64px 20px; }
    .section-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; text-align: center; }
    .section-subtitle { text-align: center; color: #6b7280; margin-bottom: 40px; }

    /* ── Packages grid ── */
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .pkg-card {
      background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
    }
    .pkg-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .pkg-body { padding: 24px; }
    .pkg-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; color: #111827; }
    .pkg-meta { font-size: 0.875rem; color: #6b7280; margin: 0 0 20px; }
    .pkg-cta {
      display: inline-block; background: #0f172a; color: #fff; text-decoration: none;
      padding: 10px 24px; border-radius: 6px; font-size: 0.875rem; font-weight: 600;
    }
    .pkg-cta:hover { background: #1e293b; }
    .no-packages { text-align: center; color: #6b7280; font-style: italic; }

    /* ── FAQ ── */
    .faq-list { max-width: 720px; margin: 0 auto; }
    .faq-item {
      border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px;
      overflow: hidden;
    }
    .faq-question {
      cursor: pointer; padding: 18px 20px; font-size: 1rem; font-weight: 600;
      list-style: none; display: flex; justify-content: space-between; align-items: center;
      background: #fff; user-select: none;
    }
    .faq-question::after { content: "+"; font-size: 1.25rem; color: #3b82f6; }
    details[open] .faq-question::after { content: "−"; }
    .faq-answer { padding: 0 20px 18px; color: #374151; line-height: 1.7; margin: 0; }

    /* ── Enquiry CTA ── */
    .cta-section { background: #0f172a; color: #fff; text-align: center; padding: 64px 20px; }
    .cta-section h2 { font-size: 2rem; margin-bottom: 12px; }
    .cta-section p { opacity: 0.8; margin-bottom: 28px; }
    .cta-form { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-width: 500px; margin: 0 auto; }
    .cta-form input {
      flex: 1; min-width: 200px; padding: 12px 16px; border-radius: 6px;
      border: none; font-size: 1rem; outline: none;
    }
    .cta-form button {
      background: #3b82f6; color: #fff; border: none; padding: 12px 28px;
      border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer;
    }

    /* ── Footer ── */
    footer { background: #111827; color: #9ca3af; text-align: center; padding: 24px 20px; font-size: 0.85rem; }
  </style>
</head>
<body>

  <!-- Hero Section -->
  <div class="hero">
    ${badgeText ? `<div class="badge">${badgeText}</div>` : ""}
    <h1>${heroHeadline || "Your Dream Holiday Awaits"}</h1>
    <p>${heroSubheadline || "Handcrafted travel experiences, exclusively for you."}</p>
    ${slotYear ? `<p class="season">Season ${slotYear}</p>` : ""}
    <div class="trust-badges">
      ${badges.map((b) => `<div class="trust-badge">${b}</div>`).join("")}
    </div>
    <a href="#packages" class="hero-cta">Explore Packages</a>
  </div>

  <!-- Packages Section -->
  <div class="section" id="packages">
    <h2 class="section-title">Featured Holiday Packages</h2>
    <p class="section-subtitle">Curated experiences for every type of traveller</p>
    <div class="packages-grid">
      ${packagesHtml}
    </div>
  </div>

  ${faqSection.length > 0 ? `
  <!-- FAQ Section -->
  <div class="section" style="background:#fff; max-width:100%; padding:64px 0;">
    <div style="max-width:1100px; margin:0 auto; padding:0 20px;">
      <h2 class="section-title">Frequently Asked Questions</h2>
      <p class="section-subtitle">Everything you need to know before you book</p>
      <div class="faq-list">
        ${faqHtml}
      </div>
    </div>
  </div>
  ` : ""}

  <!-- Enquiry CTA Section -->
  <div class="cta-section" id="enquire">
    <h2>Ready to Book Your Holiday?</h2>
    <p>Leave your details and our travel experts will get back to you within 24 hours.</p>
    <div class="cta-form">
      <input type="text" placeholder="Your Name" />
      <input type="email" placeholder="Your Email" />
      <button type="button">Send Enquiry</button>
    </div>
  </div>

  <footer>
    &copy; ${new Date().getFullYear()} ${title || "The Vacation Voice"} &mdash; All rights reserved.
  </footer>

</body>
</html>`;
  }

  function downloadBuffer(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportHtml() {
    downloadBuffer(`${slug || "landing-page"}.html`, generateHtml());
  }

  function exportPhp() {
    const phpHeader = `<?php\n// Generated Landing Page Buffer\n// Date: ${new Date().toISOString()}\n?>\n`;
    downloadBuffer(`${slug || "landing-page"}.php`, phpHeader + generateHtml());
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Create New Landing Page</h2>
        <div className="flex gap-2">
          <button type="button" onClick={exportHtml} className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export HTML
          </button>
          <button type="button" onClick={exportPhp} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export PHP
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <input required className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dubai Summer Special" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. dubai-summer-special" />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-3">Hero Section Customizer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Badge Text</label>
              <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="e.g. Bestseller 2026" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Slot Year</label>
              <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" type="number" value={slotYear} onChange={(e) => setSlotYear(e.target.value)} placeholder="2026" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Headline</label>
              <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} placeholder="Main Hero Text" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Subheadline</label>
              <textarea className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" rows={2} value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} placeholder="Supporting Hero Text" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Background Image</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                className="w-full bg-background border-2 border-dashed border-border rounded-md px-3 py-6 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-slate-50 transition-colors"
              >
                <div className="mb-2">Drag and drop an image here to upload, or paste a URL below.</div>
                <input className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm text-foreground" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://example.com/image.jpg" />
                {heroImage && heroImage.startsWith("data:image") && (
                  <div className="mt-2 text-xs text-primary font-medium">Local image selected and encoded.</div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Trust Badges (comma-separated)</label>
              <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={trustBadges} onChange={(e) => setTrustBadges(e.target.value)} placeholder="500+ Happy Travelers, 4.8 Avg Rating, 0 Hidden Costs" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-3">Dynamic Package Selector</h3>
          <p className="text-sm text-muted-foreground mb-3">Select packages to map into this landing page layout. Drag selected items to reorder them.</p>
          <div className="bg-background border border-input rounded-md p-3 max-h-64 overflow-y-auto space-y-2">
            {packagesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground text-center">Loading packages...</p>
            ) : packagesQuery.data?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No packages available.</p>
            ) : (
              <>
                {/* Render Selected Items First so they can be dragged to reorder */}
                {selectedPackages.map(id => {
                  const pkg = packagesQuery.data?.items.find(p => p.id === id);
                  if (!pkg) return null;
                  return (
                    <label 
                      key={pkg.id} 
                      draggable
                      onDragStart={() => handlePackageDragStart(pkg.id)}
                      onDragOver={(e) => handlePackageDragOver(e, pkg.id)}
                      onDragEnd={handlePackageDragEnd}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-grab active:cursor-grabbing border ${draggedPkgId === pkg.id ? 'opacity-50 border-primary' : 'border-border bg-slate-50'}`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-primary"
                        checked={true}
                        onChange={() => togglePackage(pkg.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pkg.title}</p>
                        <p className="text-xs text-muted-foreground">{pkg.destinationId} • {pkg.durationDays} Days</p>
                      </div>
                      <div className="text-muted-foreground/50">☰</div>
                    </label>
                  );
                })}
                {/* Render Unselected Items Below */}
                {packagesQuery.data?.items.filter(p => !selectedPackages.includes(p.id)).map((pkg) => (
                  <label key={pkg.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer border border-transparent">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary"
                      checked={false}
                      onChange={() => togglePackage(pkg.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{pkg.title}</p>
                      <p className="text-xs text-muted-foreground">{pkg.destinationId} • {pkg.durationDays} Days</p>
                    </div>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Why Choose Us & FAQ Blocks</h3>
            <button type="button" onClick={addFaq} className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {faqSection.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-background rounded-md border border-input">No FAQs added yet.</p>
            ) : (
              faqSection.map((faq, index) => (
                <div 
                  key={index} 
                  draggable
                  onDragStart={() => handleFaqDragStart(index)}
                  onDragOver={(e) => handleFaqDragOver(e, index)}
                  onDragEnd={handleFaqDragEnd}
                  className={`flex gap-3 items-start bg-background p-3 rounded-md border cursor-grab active:cursor-grabbing ${draggedFaqIndex === index ? 'opacity-50 border-primary shadow-sm' : 'border-input'}`}
                >
                  <div className="pt-2 cursor-grab active:cursor-grabbing text-muted-foreground/50">
                    ☰
                  </div>
                  <div className="flex-1 space-y-3">
                    <input className="w-full bg-transparent border-b border-border px-1 py-1 text-sm font-medium focus:outline-none focus:border-primary" placeholder="Question?" value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} />
                    <textarea className="w-full bg-transparent border-none px-1 py-1 text-sm resize-none focus:outline-none text-muted-foreground" rows={2} placeholder="Answer text..." value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeFaq(index)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors" title="Remove FAQ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 flex gap-3 border-t border-border">
          <button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium disabled:opacity-50">
            {isSaving ? "Publishing..." : "Publish Page"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSaving} className="border border-input bg-background px-6 py-2 rounded-md font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
