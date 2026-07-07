"use client";

import Link from "next/link";
import { BACKEND_GAPS, UNAVAILABLE_METRIC } from "../constants";
import { useContentPerformanceQuery } from "../hooks/useMarketingQueries";
import { formatDate } from "../utils";
import { BackendGapNotice, UnavailableMetric } from "./BackendGapNotice";
import { MarketingPageShell } from "./MarketingPageShell";

export function ContentPerformancePage() {
  const contentQuery = useContentPerformanceQuery();
  const data = contentQuery.data;

  return (
    <MarketingPageShell
      title="Content Performance"
      description="Featured and recently updated content from Website BFF and admin APIs."
      isLoading={contentQuery.isLoading}
      isError={contentQuery.isError}
      errorMessage={contentQuery.error instanceof Error ? contentQuery.error.message : undefined}
      isRefreshing={contentQuery.isFetching}
      onRefresh={() => void contentQuery.refetch()}
      onRetry={() => void contentQuery.refetch()}
    >
      <BackendGapNotice title="Popular pages" message={BACKEND_GAPS.topPagesAnalytics} />

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <ContentPanel title="Featured packages (homepage)">
          {(data?.featuredPackages.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.featuredPackages.map((pkg) => (
                <li key={pkg.slug} className="text-sm border-b border-border pb-2">
                  <Link href={`/packages?search=${encodeURIComponent(pkg.slug)}`} className="font-medium text-primary hover:underline">
                    {pkg.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{pkg.destinationName} · /packages/{pkg.slug}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>

        <ContentPanel title="Featured destinations (homepage)">
          {(data?.featuredDestinations.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.featuredDestinations.map((dest) => (
                <li key={dest.slug} className="text-sm border-b border-border pb-2">
                  <Link href={`/destinations?search=${encodeURIComponent(dest.slug)}`} className="font-medium text-primary hover:underline">
                    {dest.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">/destinations/{dest.slug}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>

        <ContentPanel title="Latest packages (homepage)">
          {(data?.latestPackages.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.latestPackages.map((pkg) => (
                <li key={pkg.slug} className="text-sm border-b border-border pb-2">
                  <p className="font-medium">{pkg.title}</p>
                  <p className="text-xs text-muted-foreground">{pkg.destinationName}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>

        <ContentPanel title="Popular destinations (navigation)">
          {(data?.popularDestinations.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.popularDestinations.map((dest) => (
                <li key={dest.slug} className="text-sm border-b border-border pb-2">
                  <p className="font-medium">{dest.name}</p>
                  <p className="text-xs text-muted-foreground">/destinations/{dest.slug}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <ContentPanel title="Recently updated packages">
          {(data?.recentlyUpdatedPackages.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.recentlyUpdatedPackages.map((pkg) => (
                <li key={pkg.id} className="text-sm border-b border-border pb-2">
                  <Link href={`/packages?search=${encodeURIComponent(pkg.slug)}`} className="font-medium text-primary hover:underline">
                    {pkg.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDate(pkg.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>

        <ContentPanel title="Recently updated destinations">
          {(data?.recentlyUpdatedDestinations.length ?? 0) === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data?.recentlyUpdatedDestinations.map((dest) => (
                <li key={dest.id} className="text-sm border-b border-border pb-2">
                  <Link href={`/destinations?search=${encodeURIComponent(dest.slug)}`} className="font-medium text-primary hover:underline">
                    {dest.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDate(dest.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </ContentPanel>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6">
        <h3 className="font-semibold mb-2">Popular pages</h3>
        <UnavailableMetric label={UNAVAILABLE_METRIC} />
      </div>
    </MarketingPageShell>
  );
}

function ContentPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No items</p>;
}
