"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Trash2, GripVertical, Settings } from "lucide-react";
import { usePackagesQuery } from "@/features/admin-packages/hooks/usePackagesQuery";

interface LandingPageEditorProps {
  onCancel: () => void;
}

export function LandingPageEditor({ onCancel }: LandingPageEditorProps) {
  const queryClient = useQueryClient();
  const packagesQuery = usePackagesQuery({});
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function addBlock(type: string) {
    const newBlock = { id: crypto.randomUUID(), type, config: {} };
    if (type === 'HERO') newBlock.config = { headline: '', subheadline: '', badgeText: '', backgroundImage: '' };
    if (type === 'MARKETING_HERO') newBlock.config = { headline: '', subheadline: '', pricePoint: '', urgencyText: '', whatsappNumber: '', phoneNumber: '', backgroundImage: '', showTripAdvisor: true, showGoogle: true, showGovt: true };
    if (type === 'PACKAGES') newBlock.config = { packageIds: [] };
    if (type === 'FAQS') newBlock.config = { items: [] };
    setBlocks([...blocks, newBlock]);
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter(b => b.id !== id));
  }

  function updateBlockConfig(id: string, key: string, value: any) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, config: { ...b.config, [key]: value } } : b));
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    }
    if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
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
          blocks,
          seo: { 
            title: seoTitle, 
            description: seoDescription,
            tracking: {
              fbPixelId,
              googleAdsId
            }
          },
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

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dynamic Landing Page Builder</h2>
        <div className="flex gap-2">
           <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">JSON Mode Active</span>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <input required className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dubai Summer Special" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. dubai-summer-special" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Title</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Meta Title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Description</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta Description" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Facebook Pixel ID</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)} placeholder="e.g. 1226523166034677" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Google Ads ID</label>
            <input className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={googleAdsId} onChange={(e) => setGoogleAdsId(e.target.value)} placeholder="e.g. AW-16668991299" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Page Blocks</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => addBlock('MARKETING_HERO')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">+ Marketing Hero</button>
              <button type="button" onClick={() => addBlock('HERO')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">+ Hero</button>
              <button type="button" onClick={() => addBlock('PACKAGES')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">+ Packages</button>
              <button type="button" onClick={() => addBlock('FAQS')} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">+ FAQs</button>
            </div>
          </div>

          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
                No blocks added. Click above to add sections to your page.
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="font-medium text-sm">{block.type} Block</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">↑</button>
                      <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">↓</button>
                      <button type="button" onClick={() => removeBlock(block.id)} className="text-muted-foreground hover:text-destructive ml-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {block.type === 'MARKETING_HERO' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Headline</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="e.g. Andaman Holiday Packages" value={block.config.headline} onChange={e => updateBlockConfig(block.id, 'headline', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Subheadline</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="e.g. All-inclusive Andaman trips..." value={block.config.subheadline} onChange={e => updateBlockConfig(block.id, 'subheadline', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Price Point (e.g. Starting ₹10,500)</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.pricePoint} onChange={e => updateBlockConfig(block.id, 'pricePoint', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Urgency Text (e.g. Explore 572 Islands)</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.urgencyText} onChange={e => updateBlockConfig(block.id, 'urgencyText', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">WhatsApp Number</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="+91..." value={block.config.whatsappNumber} onChange={e => updateBlockConfig(block.id, 'whatsappNumber', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Phone Number</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="+91..." value={block.config.phoneNumber} onChange={e => updateBlockConfig(block.id, 'phoneNumber', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Background Image URL</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="https://..." value={block.config.backgroundImage} onChange={e => updateBlockConfig(block.id, 'backgroundImage', e.target.value)} />
                        </div>
                        <div className="col-span-2 flex gap-6 mt-2">
                          <label className="flex items-center gap-2 text-xs font-medium">
                            <input type="checkbox" checked={block.config.showTripAdvisor} onChange={e => updateBlockConfig(block.id, 'showTripAdvisor', e.target.checked)} /> Show TripAdvisor Badge
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium">
                            <input type="checkbox" checked={block.config.showGoogle} onChange={e => updateBlockConfig(block.id, 'showGoogle', e.target.checked)} /> Show Google Badge
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium">
                            <input type="checkbox" checked={block.config.showGovt} onChange={e => updateBlockConfig(block.id, 'showGovt', e.target.checked)} /> Show Govt Badge
                          </label>
                        </div>
                      </div>
                    )}
                    {block.type === 'HERO' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Headline</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.headline} onChange={e => updateBlockConfig(block.id, 'headline', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Background Image URL</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="https://..." value={block.config.backgroundImage} onChange={e => updateBlockConfig(block.id, 'backgroundImage', e.target.value)} />
                        </div>
                      </div>
                    )}
                    {block.type === 'PACKAGES' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Eyebrow (e.g. Itineraries)</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.eyebrow || ''} onChange={e => updateBlockConfig(block.id, 'eyebrow', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Headline</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.headline || ''} onChange={e => updateBlockConfig(block.id, 'headline', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Description</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.description || ''} onChange={e => updateBlockConfig(block.id, 'description', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Select Packages (Comma separated IDs for now)</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" placeholder="pkg_123, pkg_456" value={(block.config.packageIds || []).join(', ')} onChange={e => updateBlockConfig(block.id, 'packageIds', e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean))} />
                        </div>
                      </div>
                    )}
                    {block.type === 'FAQS' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Eyebrow (e.g. FAQs)</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.eyebrow || ''} onChange={e => updateBlockConfig(block.id, 'eyebrow', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Headline</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.headline || ''} onChange={e => updateBlockConfig(block.id, 'headline', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Description</label>
                          <input className="w-full border-input bg-transparent border rounded-md px-3 py-1.5 text-sm" value={block.config.description || ''} onChange={e => updateBlockConfig(block.id, 'description', e.target.value)} />
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground mt-4 border-t border-border pt-4">
                          FAQ item editor coming soon... (manage questions globally)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-6 flex gap-3 border-t border-border">
          <button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Dynamic Page"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSaving} className="border border-input bg-background px-6 py-2 rounded-md font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
