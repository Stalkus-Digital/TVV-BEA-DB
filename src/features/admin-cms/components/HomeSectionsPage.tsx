"use client";

import Link from "next/link";
import { useState } from "react";
import { BACKEND_GAPS } from "../constants";
import { useUpdateFeaturedMutation } from "../hooks/useCmsMutations";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import { formatDate } from "../utils";
import { BackendGapNotice } from "./BackendGapNotice";
import { CmsPageShell } from "./CmsPageShell";

export function HomeSectionsPage() {
  const cms = useCmsContentQuery();
  const featuredMutation = useUpdateFeaturedMutation();
  const [error, setError] = useState<string | null>(null);

  async function toggleFeatured(id: string, current: boolean) {
    setError(null);
    try {
      await featuredMutation.mutateAsync({ id, isFeatured: !current });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured status");
    }
  }

  return (
    <CmsPageShell
      title="Home Page Sections"
      description="Read homepage output from GET /api/website/home. Featured destinations can be toggled via Destination PATCH."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => void cms.refetch()}
      onRetry={() => void cms.refetch()}
    >
      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Hero banner</h2>
        <BackendGapNotice title="Read-only — no write API" message={BACKEND_GAPS.heroBannerWrite} />
        {cms.home?.heroBanner && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-2 text-sm">
            <p><span className="text-muted-foreground">Headline:</span> {cms.home.heroBanner.headline}</p>
            <p><span className="text-muted-foreground">Subheadline:</span> {cms.home.heroBanner.subheadline}</p>
            <p><span className="text-muted-foreground">CTA:</span> {cms.home.heroBanner.ctaLabel} → {cms.home.heroBanner.ctaUrl}</p>
            <p><span className="text-muted-foreground">Background:</span> {cms.home.heroBanner.backgroundImage ?? "—"}</p>
          </div>
        )}
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured packages</h2>
        <BackendGapNotice title="Read-only — no curation API" message={BACKEND_GAPS.featuredPackagesCurate} />
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">From price</th>
              </tr>
            </thead>
            <tbody>
              {(cms.home?.featuredPackages ?? []).map((pkg) => (
                <tr key={pkg.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/packages?selected=${pkg.id}`} className="text-primary hover:underline">
                      {pkg.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{pkg.destinationName || "—"}</td>
                  <td className="px-4 py-3">
                    {pkg.fromPrice != null ? `${pkg.currency} ${pkg.fromPrice.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
              {(cms.home?.featuredPackages.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No published packages on homepage</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Featured destinations</h2>
        <p className="text-sm text-muted-foreground">
          Toggle <code className="text-xs bg-muted px-1 rounded">isFeatured</code> via PATCH /api/destinations/:id.
          Homepage uses GET /api/destinations/featured.
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Featured</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {cms.destinations.map((destination) => (
                <tr key={destination.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/destinations?selected=${destination.id}`} className="text-primary hover:underline">
                      {destination.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{destination.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(destination.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={featuredMutation.isPending}
                      onClick={() => void toggleFeatured(destination.id, destination.isFeatured)}
                      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {destination.isFeatured ? "Remove featured" : "Mark featured"}
                    </button>
                  </td>
                </tr>
              ))}
              {cms.destinations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No destinations</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <BackendGapNotice title="Read-only — no write API" message={BACKEND_GAPS.quickLinksWrite} />
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {(cms.home?.quickLinks ?? []).map((link) => (
            <li key={link.url} className="px-4 py-3 text-sm flex justify-between">
              <span>{link.label}</span>
              <span className="text-muted-foreground font-mono text-xs">{link.url}</span>
            </li>
          ))}
        </ul>
      </section>
    </CmsPageShell>
  );
}
