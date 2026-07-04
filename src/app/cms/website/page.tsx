import { Globe, Save, Sliders, Layout, Link2, ShieldCheck } from "lucide-react";

export default function WebsiteManagementPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure default site domains, navigation links, layout headers, footer widgets, and SEO metadata.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        {/* Domain Config */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" /> Domain Configuration
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Primary Domain</label>
              <input
                type="text"
                defaultValue="thevacationvoice.com"
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Staging / Test Domain</label>
              <input
                type="text"
                defaultValue="staging.thevacationvoice.com"
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Global Metadata (SEO) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Sliders className="h-5 w-5 text-primary" /> SEO & Branding Metadata
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Site Title Prefix</label>
              <input
                type="text"
                defaultValue="The Vacation Voice | Modern Travel Operator"
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Meta Description</label>
              <textarea
                rows={3}
                defaultValue="Book custom and pre-packaged holiday tours, flights, and activities with local operators. Andaman's premium travel portal."
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Theme / Header settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Layout className="h-5 w-5 text-primary" /> Header & Logo Branding
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Brand Logo URL</label>
              <input
                type="text"
                defaultValue="/images/brand-logo-dark.png"
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Favicon URL</label>
              <input
                type="text"
                defaultValue="/favicon.ico"
                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Quick Links & Scripts */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Link2 className="h-5 w-5 text-primary" /> Footer Quick Links
          </h3>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-center gap-4 py-2 border-b border-border">
              <div className="font-semibold w-24">Link Title</div>
              <div className="font-semibold flex-1">Target Route</div>
            </div>
            <div className="flex items-center gap-4">
              <input type="text" defaultValue="About Us" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-24" />
              <input type="text" defaultValue="/about" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <input type="text" defaultValue="Tours" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-24" />
              <input type="text" defaultValue="/packages" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <input type="text" defaultValue="Terms" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-24" />
              <input type="text" defaultValue="/terms-conditions" className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
