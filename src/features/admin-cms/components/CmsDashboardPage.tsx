"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText, Globe, Image, Layout, Link2, Megaphone } from "lucide-react";
import { CMS_SECTIONS, BACKEND_GAPS } from "../constants";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import { BackendGapNotice } from "./BackendGapNotice";
import { CmsPageShell } from "./CmsPageShell";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "/cms": Layout,
  "/cms/home": Megaphone,
  "/cms/seo": Globe,
  "/cms/faqs": FileText,
  "/cms/media": Image,
  "/cms/navigation": Link2,
};

export function CmsDashboardPage() {
  const cms = useCmsContentQuery();

  return (
    <CmsPageShell
      title="Content Dashboard"
      description="Overview of website content — sourced from the Website BFF and existing Destination/Package APIs."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => void cms.refetch()}
      onRetry={() => void cms.refetch()}
    >
      <BackendGapNotice title="CMS Engine not implemented" message={BACKEND_GAPS.cmsModule} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard label="Featured destinations" value={cms.stats.featuredDestinationCount} />
        <StatCard label="Featured packages (homepage)" value={cms.stats.publishedPackageCount} />
        <StatCard label="Destination FAQs" value={cms.stats.destinationFaqCount} />
        <StatCard label="Package FAQs" value={cms.stats.packageFaqCount} />
        <StatCard label="Menu items" value={cms.stats.menuItemCount} />
        <StatCard label="Footer links" value={cms.stats.footerLinkCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-3">Homepage preview</h3>
          {cms.home ? (
            <dl className="space-y-2 text-sm">
              <Row label="Hero headline" value={cms.home.heroBanner.headline} />
              <Row label="Featured packages" value={String(cms.home.featuredPackages.length)} />
              <Row label="Featured destinations" value={String(cms.home.featuredDestinations.length)} />
              <Row label="Quick links" value={String(cms.home.quickLinks.length)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No homepage data</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-3">Navigation preview</h3>
          {cms.navigation ? (
            <dl className="space-y-2 text-sm">
              <Row label="Top menu items" value={String(cms.navigation.menu.length)} />
              <Row label="Footer columns" value={String(cms.navigation.footer.columns.length)} />
              <Row label="Popular destinations" value={String(cms.navigation.popularDestinations.length)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No navigation data</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">CMS sections</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CMS_SECTIONS.filter((section) => section.href !== "/cms").map((section) => {
            const Icon = SECTION_ICONS[section.href] ?? FileText;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </CmsPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
