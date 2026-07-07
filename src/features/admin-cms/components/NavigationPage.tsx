"use client";

import { BACKEND_GAPS } from "../constants";
import { useWebsiteNavigationQuery } from "../hooks/useCmsQueries";
import { BackendGapNotice } from "./BackendGapNotice";
import { CmsPageShell } from "./CmsPageShell";

export function NavigationPage() {
  const navigationQuery = useWebsiteNavigationQuery();

  return (
    <CmsPageShell
      title="Navigation Menus"
      description="Read-only view from GET /api/website/navigation — menu items are static in NavigationService."
      isLoading={navigationQuery.isLoading}
      isError={navigationQuery.isError}
      errorMessage={navigationQuery.error instanceof Error ? navigationQuery.error.message : undefined}
      isRefreshing={navigationQuery.isFetching}
      onRefresh={() => void navigationQuery.refetch()}
      onRetry={() => void navigationQuery.refetch()}
      isEmpty={!navigationQuery.isLoading && !navigationQuery.isError && (navigationQuery.data?.menu.length ?? 0) === 0}
      emptyMessage="No menu items returned"
    >
      <BackendGapNotice title="Read-only — no write API" message={BACKEND_GAPS.navigationWrite} />

      <div className="rounded-xl border border-border bg-card divide-y divide-border mt-6">
        {(navigationQuery.data?.menu ?? []).map((item) => (
          <div key={item.url} className="px-4 py-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.url}</span>
            </div>
            {item.children && item.children.length > 0 && (
              <ul className="mt-2 ml-4 space-y-1 border-l border-border pl-3">
                {item.children.map((child) => (
                  <li key={child.url} className="flex justify-between text-xs text-muted-foreground">
                    <span>{child.label}</span>
                    <span className="font-mono">{child.url}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Popular destinations (dynamic)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These are resolved from the Destination Engine at request time — not editable here.
        </p>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {(navigationQuery.data?.popularDestinations ?? []).map((dest) => (
            <li key={dest.id} className="px-4 py-3 text-sm flex justify-between">
              <span>{dest.name}</span>
              <span className="font-mono text-xs text-muted-foreground">/destinations/{dest.slug}</span>
            </li>
          ))}
          {(navigationQuery.data?.popularDestinations.length ?? 0) === 0 && (
            <li className="px-4 py-8 text-center text-muted-foreground">No destinations</li>
          )}
        </ul>
      </section>
    </CmsPageShell>
  );
}
