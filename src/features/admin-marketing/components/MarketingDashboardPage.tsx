"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, FileText, Globe, Layout, Megaphone, Search, TrendingUp } from "lucide-react";
import { MARKETING_SECTIONS } from "../constants";
import { useMarketingDashboardQuery } from "../hooks/useMarketingQueries";
import { formatDate, formatRate } from "../utils";
import { MarketingPageShell } from "./MarketingPageShell";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "/marketing": BarChart3,
  "/marketing/campaigns": Megaphone,
  "/marketing/landing-pages": Layout,
  "/marketing/forms": FileText,
  "/marketing/seo": Search,
  "/marketing/content": TrendingUp,
};

export function MarketingDashboardPage() {
  const dashboardQuery = useMarketingDashboardQuery();
  const data = dashboardQuery.data;

  return (
    <MarketingPageShell
      title="Marketing Dashboard"
      description="Lead and conversion metrics from enquiries, quotes, and bookings APIs."
      isLoading={dashboardQuery.isLoading}
      isError={dashboardQuery.isError}
      errorMessage={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : undefined}
      isRefreshing={dashboardQuery.isFetching}
      onRefresh={() => void dashboardQuery.refetch()}
      onRetry={() => void dashboardQuery.refetch()}
    >

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard label="Total leads" value={String(data?.leads.total ?? 0)} />
        <StatCard label="New this week" value={String(data?.leads.newThisWeek ?? 0)} />
        <StatCard label="Quotes" value={String(data?.funnel.quotes ?? 0)} />
        <StatCard label="Bookings" value={String(data?.funnel.bookings ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel title="Website traffic">
          {!data?.websiteTrafficAvailable ? (
            <div className="h-24 flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground mt-4">
              Website traffic data unavailable
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Page Views</p>
                <p className="text-2xl font-bold mt-1">{data.websiteTraffic?.totalViews || 0}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Unique Visitors</p>
                <p className="text-2xl font-bold mt-1">{data.websiteTraffic?.uniqueVisitors || 0}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sessions</p>
                <p className="text-2xl font-bold mt-1">{data.websiteTraffic?.totalSessions || 0}</p>
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Conversion funnel">
          {data && (
            <dl className="space-y-2 text-sm">
              <Row label="Enquiries" value={String(data.funnel.enquiries)} />
              <Row label="Quotes" value={String(data.funnel.quotes)} />
              <Row label="Bookings" value={String(data.funnel.bookings)} />
              <Row label="Enquiry → Quote" value={formatRate(data.funnel.enquiryToQuoteRate)} />
              <Row label="Quote → Booking" value={formatRate(data.funnel.quoteToBookingRate)} />
            </dl>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel title="Top destinations">
          {!data?.topDestinationsAvailable ? (
            <div className="h-24 flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground mt-4">
              Destination metrics unavailable
            </div>
          ) : (
            <ul className="space-y-3 mt-4">
              {data.featuredDestinations.map((dest) => (
                <li key={dest.slug} className="flex justify-between items-center text-sm">
                  <span>{dest.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Top packages">
          {!data?.topPackagesAvailable ? (
            <div className="h-24 flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground mt-4">
              Package metrics unavailable
            </div>
          ) : (
            <ul className="space-y-3 mt-4">
              {data.featuredPackages.map((pkg) => (
                <li key={pkg.slug} className="flex justify-between items-center text-sm">
                  <span>{pkg.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel title="Recent enquiries">
          {(data?.recentEnquiries.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="space-y-2">
              {data?.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="text-sm border-b border-border pb-2">
                  <Link href="/cms/enquiries" className="font-medium text-primary hover:underline">
                    {enquiry.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{enquiry.type} · {enquiry.status} · {formatDate(enquiry.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent quote requests">
          {(data?.recentQuotes.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No quotes yet.</p>
          ) : (
            <ul className="space-y-2">
              {data?.recentQuotes.map((quote) => (
                <li key={quote.id} className="text-sm border-b border-border pb-2">
                  <Link href="/quotes" className="font-medium text-primary hover:underline">
                    {quote.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{quote.quoteNumber} · {quote.status} · {formatDate(quote.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Marketing sections</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MARKETING_SECTIONS.filter((s) => s.href !== "/marketing").map((section) => {
            const Icon = SECTION_ICONS[section.href] ?? Globe;
            return (
              <Link key={section.href} href={section.href} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted transition-colors">
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
    </MarketingPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
