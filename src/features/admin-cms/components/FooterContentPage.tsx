"use client";

import { BACKEND_GAPS } from "../constants";
import { useWebsiteNavigationQuery } from "../hooks/useCmsQueries";
import { BackendGapNotice } from "./BackendGapNotice";
import { CmsPageShell } from "./CmsPageShell";

export function FooterContentPage() {
  const navigationQuery = useWebsiteNavigationQuery();

  return (
    <CmsPageShell
      title="Footer Content"
      description="Read-only view from GET /api/website/navigation — footer columns are static in NavigationService."
      isLoading={navigationQuery.isLoading}
      isError={navigationQuery.isError}
      errorMessage={navigationQuery.error instanceof Error ? navigationQuery.error.message : undefined}
      isRefreshing={navigationQuery.isFetching}
      onRefresh={() => void navigationQuery.refetch()}
      onRetry={() => void navigationQuery.refetch()}
    >
      <BackendGapNotice title="Read-only — no write API" message={BACKEND_GAPS.footerWrite} />

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {(navigationQuery.data?.footer.columns ?? []).map((column) => (
          <div key={column.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.url} className="flex justify-between text-sm">
                  <span>{link.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{link.url}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Quick links</h2>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {(navigationQuery.data?.quickLinks ?? []).map((link) => (
            <li key={link.url} className="px-4 py-3 text-sm flex justify-between">
              <span>{link.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{link.url}</span>
            </li>
          ))}
        </ul>
      </section>
    </CmsPageShell>
  );
}
