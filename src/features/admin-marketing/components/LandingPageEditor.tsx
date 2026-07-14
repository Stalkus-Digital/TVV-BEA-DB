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
  const [showHeroForm, setShowHeroForm] = useState(true);
  
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
            showHeroForm,
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
    const allPackages = packagesQuery.data?.items ?? [];
    const selectedPkgObjects = allPackages.filter((p) => selectedPackages.includes(p.id));
    const badges = trustBadges.split(",").map((b) => b.trim()).filter(Boolean);

    const packagesHtml = selectedPkgObjects.length > 0
      ? selectedPkgObjects.map((pkg) => `
        <div class="pkg-card">
          <div class="pkg-body">
            <h3 class="pkg-title">${pkg.title}</h3>
            <p class="pkg-meta">${pkg.durationDays} Days / ${pkg.durationNights ?? pkg.durationDays - 1} Nights</p>
            <div class="pkg-price-row">
              <span class="pkg-price">From ${pkg.currency || '$'}${pkg.displayPrice || '---'}</span>
              <a href="#enquire" onclick="document.querySelector('#leadForm').scrollIntoView(); return false;" class="pkg-cta">View Details</a>
            </div>
          </div>
        </div>`).join("")
      : "<p class=\"no-packages\">Packages coming soon — contact us for exclusive deals.</p>";

    const faqHtml = faqSection.length > 0
      ? faqSection.map((f) => `
        <details class="faq-item" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; overflow: hidden; background: #fff;">
          <summary style="cursor: pointer; padding: 18px 20px; font-weight: 600; list-style: none;">${f.question}</summary>
          <p style="padding: 0 20px 18px; color: #374151; margin: 0;">${f.answer}</p>
        </details>`).join("")
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${heroSubheadline || title}">
  <title>${title || "Landing Page"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Poppins', system-ui, sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #1f2937; scroll-behavior: smooth; }
    a { color: inherit; text-decoration: none; }

    /* ── Hero ── */
    .hero {
      position: relative;
      min-height: 600px;
      padding: 100px 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      ${heroImage ? `background: url('${heroImage}') center/cover no-repeat;` : ""}
      color: #fff;
    }
    .hero::before { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
    .hero-container { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; display: flex; gap: 40px; align-items: center; flex-wrap: wrap; }
    .hero-content { flex: 1; min-width: 300px; }
    .hero-form-wrapper { flex: 0 0 400px; background: #fff; color: #111; padding: 32px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    
    @media (max-width: 900px) {
      .hero-form-wrapper { flex: 1 1 100%; margin-top: 40px; }
      .hero { padding: 60px 20px; }
    }

    .badge { display: inline-block; background: #3b82f6; color: #fff; padding: 6px 16px; border-radius: 99px; font-size: 0.85rem; font-weight: 700; margin-bottom: 20px; }
    .hero h1 { font-size: clamp(2rem, 4vw, 3.5rem); margin: 0 0 16px; line-height: 1.2; font-weight: 800; }
    .hero p { font-size: 1.15rem; margin: 0 0 16px; opacity: 0.9; }
    
    .trust-badges { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
    .trust-badge { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; backdrop-filter: blur(4px); }

    /* ── Hero Form ── */
    .hero-form-wrapper h3 { margin: 0 0 8px; font-size: 1.5rem; font-weight: 700; color: #111; }
    .hero-form-wrapper p { margin: 0 0 24px; font-size: 0.9rem; color: #555; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 0.85rem; font-weight: 600; color: #333; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; font-family: inherit; outline: none; }
    .form-group input:focus { border-color: #3b82f6; }
    .form-submit { width: 100%; background: #3b82f6; color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    .form-submit:hover { background: #2563eb; }

    /* ── Tabs ── */
    .tabs-nav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 50; display: flex; justify-content: center; gap: 40px; padding: 0 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .tab-btn { background: none; border: none; padding: 20px 0; font-size: 1rem; font-weight: 600; color: #6b7280; cursor: pointer; border-bottom: 3px solid transparent; font-family: inherit; }
    .tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    
    .tab-content { display: none; padding: 64px 20px; max-width: 1200px; margin: 0 auto; }
    .tab-content.active { display: block; }

    /* ── Packages grid ── */
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
    .pkg-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; transition: transform 0.2s; border: 1px solid #f3f4f6; }
    .pkg-card:hover { transform: translateY(-6px); }
    .pkg-body { padding: 24px; }
    .pkg-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 12px; }
    .pkg-meta { font-size: 0.9rem; color: #6b7280; margin: 0 0 24px; font-weight: 500; }
    .pkg-price-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    .pkg-price { font-size: 1.25rem; font-weight: 800; color: #111; }
    .pkg-cta { background: #111; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
    
    /* ── Placeholder content ── */
    .placeholder-box { background: #fff; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 60px 20px; text-align: center; }
    .placeholder-box h3 { font-size: 1.5rem; margin: 0 0 12px; }
    .placeholder-box p { color: #6b7280; margin: 0; }

    footer { background: #111827; color: #9ca3af; text-align: center; padding: 32px 20px; font-size: 0.9rem; }
  </style>
</head>
<body>

  <!-- Hero Section -->
  <div class="hero">
    <div class="hero-container">
      <div class="hero-content">
        ${badgeText ? `<div class="badge">${badgeText}</div>` : ""}
        <h1>${heroHeadline || "Your Dream Holiday Awaits"}</h1>
        <p>${heroSubheadline || "Handcrafted travel experiences, exclusively for you."}</p>
        <div class="trust-badges">
          ${badges.map((b) => `<div class="trust-badge">${b}</div>`).join("")}
        </div>
      </div>
      
      ${showHeroForm ? `
      <div class="hero-form-wrapper">
        <h3>Get a Free Quote</h3>
        <p>Fill out the details below and our experts will craft the perfect itinerary for you.</p>
        <form id="leadForm" onsubmit="submitLead(event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" required placeholder="+91 98765 43210" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="john@example.com" />
          </div>
          <div class="form-group">
            <label>Departure City</label>
            <input type="text" name="city" required placeholder="e.g. New Delhi" />
          </div>
          <div class="form-group">
            <label>Travel Date</label>
            <input type="date" name="date" required />
          </div>
          <button type="submit" class="form-submit" id="submitBtn">Get My Quote</button>
        </form>
      </div>` : ""}
    </div>
  </div>

  <!-- Sticky Tabs -->
  <div class="tabs-nav">
    <button class="tab-btn active" onclick="switchTab('packages')">Packages</button>
    <button class="tab-btn" onclick="switchTab('hotels')">Hotels</button>
    <button class="tab-btn" onclick="switchTab('flights')">Flights</button>
  </div>

  <!-- Packages Tab -->
  <div id="tab-packages" class="tab-content active">
    <div class="packages-grid">
      ${packagesHtml}
    </div>
  </div>

  <!-- Hotels Tab -->
  <div id="tab-hotels" class="tab-content">
    <div class="placeholder-box">
      <h3>Hotels in ${title || "this Destination"}</h3>
      <p>Premium hotels and resorts will be listed here soon. Enquire above for direct hotel bookings.</p>
    </div>
  </div>

  <!-- Flights Tab -->
  <div id="tab-flights" class="tab-content">
    <div class="placeholder-box">
      <h3>Flight Bookings</h3>
      <p>Flight connections and schedules will be listed here soon. Our packages include flight arrangements.</p>
    </div>
  </div>

  ${faqSection.length > 0 ? `
  <div style="background:#fff; padding:64px 20px;">
    <div style="max-width:800px; margin:0 auto;">
      <h2 style="font-size:2rem; text-align:center; margin-bottom:40px;">Frequently Asked Questions</h2>
      ${faqHtml}
    </div>
  </div>` : ""}

  <footer>
    &copy; ${new Date().getFullYear()} ${title || "The Vacation Voice"} &mdash; All rights reserved.
  </footer>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      event.target.classList.add('active');
    }

    async function submitLead(e) {
      e.preventDefault();
      const form = e.target;
      const btn = document.getElementById('submitBtn');
      const originalText = btn.innerText;
      
      try {
        btn.innerText = 'Submitting...';
        btn.disabled = true;
        
        const payload = {
          type: "DESTINATION",
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          message: "Lead captured from " + document.title,
          metadata: {
            departureCity: form.city.value,
            travelDate: form.date.value
          }
        };

        const res = await fetch("/api/external/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Thank you! Your quote request has been received.");
          form.reset();
        } else {
          alert("Failed to submit request. Please try again later.");
        }
      } catch (err) {
        alert("A network error occurred. Please try again.");
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    }
  </script>
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
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="heroFormToggle" checked={showHeroForm} onChange={(e) => setShowHeroForm(e.target.checked)} className="rounded border-input text-primary" />
              <label htmlFor="heroFormToggle" className="text-sm font-medium">Show Lead Capture Form in Hero Section</label>
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
