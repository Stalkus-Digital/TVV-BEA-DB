"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import type { DestinationOption } from "@/features/admin-quotes/types";
import {
  EDITABLE_PACKAGE_STATUSES,
  PACKAGE_SOURCE_TYPE_LABELS,
  PackageStatus,
} from "../constants";
import {
  useArchivePackageMutation,
  usePublishPackageMutation,
  useRollbackVersionMutation,
  useUpdatePackageMutation,
} from "../hooks/usePackageMutations";
import { usePackageQuery } from "../hooks/usePackageQuery";
import {
  usePackageAvailabilityQuery,
  usePackageComputeQuery,
  usePackagePreviewQuery,
  usePackagePricingQuery,
  usePackageRulesQuery,
  usePackageVersionsQuery,
} from "../hooks/usePackageSubQueries";
import type { Package, PackageAvailability, PackagePreview, PackagePricing, PackageRule, PackageVersion } from "../types";
import { formatDuration, formatPackageDate, formatPackageMoney, resolveDestinationName } from "../utils";
import { PackageStatusBadge } from "./PackageStatusBadge";

interface PackageDetailDrawerProps {
  packageId: string | null;
  destinations: DestinationOption[];
  onClose: () => void;
}

type TabId = "overview" | "pricing" | "rules" | "availability" | "days" | "preview" | "versions";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pricing", label: "Pricing" },
  { id: "rules", label: "Rules" },
  { id: "availability", label: "Availability" },
  { id: "days", label: "Days & Items" },
  { id: "preview", label: "Preview" },
  { id: "versions", label: "Versions" },
];

export function PackageDetailDrawer({ packageId, destinations, onClose }: PackageDetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const packageQuery = usePackageQuery(packageId);
  const previewQuery = usePackagePreviewQuery(packageId);
  const pricingQuery = usePackagePricingQuery(packageId);
  const computeQuery = usePackageComputeQuery(packageId);
  const rulesQuery = usePackageRulesQuery(packageId);
  const availabilityQuery = usePackageAvailabilityQuery(packageId);
  const versionsQuery = usePackageVersionsQuery(packageId);

  const destinationsById = useMemo(() => new Map(destinations.map((d) => [d.id, d])), [destinations]);

  if (!packageId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close package detail" />
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-xl flex flex-col">
        <div className="sticky top-0 z-10 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Package Detail</h2>
              <p className="text-xs text-muted-foreground font-mono">{packageId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/packages/new?id=${packageId}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Open builder <ExternalLink className="h-3 w-3" />
              </Link>
              <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto px-4 gap-1 pb-0">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {packageQuery.isLoading ? (
            <WidgetLoading label="Loading package…" />
          ) : packageQuery.isError || !packageQuery.data ? (
            <WidgetError message="Failed to load package" onRetry={() => void packageQuery.refetch()} />
          ) : (
            <>
              {tab === "overview" && (
                <OverviewTab pkg={packageQuery.data} destinationsById={destinationsById} packageId={packageId} />
              )}
              {tab === "pricing" && (
                <PricingTab
                  pricing={pricingQuery.data}
                  compute={computeQuery.data}
                  loading={pricingQuery.isLoading || computeQuery.isLoading}
                />
              )}
              {tab === "rules" && <RulesTab rules={rulesQuery.data} loading={rulesQuery.isLoading} />}
              {tab === "availability" && (
                <AvailabilityTab windows={availabilityQuery.data ?? []} loading={availabilityQuery.isLoading} />
              )}
              {tab === "days" && (
                <DaysTab preview={previewQuery.data} loading={previewQuery.isLoading} onRetry={() => void previewQuery.refetch()} />
              )}
              {tab === "preview" && (
                <PreviewTab preview={previewQuery.data} loading={previewQuery.isLoading} onRetry={() => void previewQuery.refetch()} />
              )}
              {tab === "versions" && (
                <VersionsTab
                  packageId={packageId}
                  versions={versionsQuery.data ?? []}
                  loading={versionsQuery.isLoading}
                  currentVersionId={packageQuery.data.currentVersionId}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  pkg,
  destinationsById,
  packageId,
}: {
  pkg: Package;
  destinationsById: Map<string, DestinationOption>;
  packageId: string;
}) {
  const [title, setTitle] = useState(pkg.title);
  const [changeNote, setChangeNote] = useState("");
  const updateMutation = useUpdatePackageMutation(packageId);
  const publishMutation = usePublishPackageMutation(packageId);
  const archiveMutation = useArchivePackageMutation(packageId);
  const editable = EDITABLE_PACKAGE_STATUSES.includes(pkg.status) && pkg.status !== PackageStatus.ARCHIVED;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{pkg.title}</h3>
          <p className="text-sm text-muted-foreground font-mono mt-1">{pkg.code}</p>
        </div>
        <PackageStatusBadge status={pkg.status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Destination</dt>
          <dd className="font-medium">{resolveDestinationName(pkg.destinationId, destinationsById)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Builder type</dt>
          <dd className="font-medium">{PACKAGE_SOURCE_TYPE_LABELS[pkg.sourceType]}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="font-medium">{formatDuration(pkg.durationDays, pkg.durationNights)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Slug</dt>
          <dd className="font-mono text-xs">{pkg.slug}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd>{formatPackageDate(pkg.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated</dt>
          <dd>{formatPackageDate(pkg.updatedAt)}</dd>
        </div>
      </dl>

      {editable && (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm font-medium">Edit title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md"
          />
          <button
            type="button"
            disabled={updateMutation.isPending || title === pkg.title}
            onClick={() => void updateMutation.mutateAsync({ title })}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Save title
          </button>
        </div>
      )}

      {pkg.status === PackageStatus.DRAFT && (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm font-medium">Publish change note (optional)</label>
          <input
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md"
            placeholder="Initial publish"
          />
          <button
            type="button"
            disabled={publishMutation.isPending}
            onClick={() => void publishMutation.mutateAsync(changeNote || undefined)}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md disabled:opacity-50"
          >
            Publish package
          </button>
        </div>
      )}

      {pkg.status !== PackageStatus.ARCHIVED && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            disabled={archiveMutation.isPending}
            onClick={() => {
              if (window.confirm("Archive this package?")) void archiveMutation.mutateAsync();
            }}
            className="px-4 py-2 text-sm border border-amber-300 text-amber-800 rounded-md hover:bg-amber-50 disabled:opacity-50"
          >
            Archive package
          </button>
          <p className="text-xs text-muted-foreground mt-2">Removes this package from the system.</p>
        </div>
      )}
    </div>
  );
}

function PricingTab({
  pricing,
  compute,
  loading,
}: {
  pricing: PackagePricing | null | undefined;
  compute: ReturnType<typeof usePackageComputeQuery>["data"];
  loading: boolean;
}) {
  if (loading) return <WidgetLoading label="Loading pricing…" />;
  if (!pricing) return <p className="text-sm text-muted-foreground">No pricing configured yet.</p>;

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Base price</dt>
          <dd className="font-medium">{formatPackageMoney(pricing.basePrice, pricing.currency)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Markup</dt>
          <dd>{pricing.markup ? `${pricing.markup.type} ${pricing.markup.value}` : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Discount</dt>
          <dd>{pricing.discount ? `${pricing.discount.type} ${pricing.discount.value}` : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{pricing.tax ? `${pricing.tax.type} ${pricing.tax.value}` : "—"}</dd>
        </div>
      </dl>

      {compute && (
        <div className="border border-border rounded-md p-4 space-y-2">
          <h4 className="text-sm font-semibold">Computed total (2 adults, backend)</h4>
          <ul className="text-sm space-y-1">
            {compute.lineItems.map((line) => (
              <li key={line.label} className="flex justify-between">
                <span className="text-muted-foreground">{line.label}</span>
                <span>{formatPackageMoney(line.amount, compute.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Final price</span>
            <span>{formatPackageMoney(compute.total, compute.currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RulesTab({ rules, loading }: { rules: PackageRule | null | undefined; loading: boolean }) {
  if (loading) return <WidgetLoading label="Loading rules…" />;
  if (!rules) return <p className="text-sm text-muted-foreground">No rules configured yet.</p>;

  return (
    <dl className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt className="text-muted-foreground">Min pax</dt>
        <dd className="font-medium">{rules.minPax}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Max pax</dt>
        <dd className="font-medium">{rules.maxPax ?? "—"}</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-muted-foreground">Refund policy</dt>
        <dd>{rules.refundPolicy ?? "—"}</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-muted-foreground">Cancellation tiers</dt>
        <dd>
          {rules.cancellationTiers.length === 0 ? (
            "—"
          ) : (
            <ul className="mt-1 space-y-1">
              {rules.cancellationTiers.map((tier, i) => (
                <li key={i}>
                  {tier.daysBeforeDeparture} days before · {tier.refundPercentage}% refund
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>
    </dl>
  );
}

function AvailabilityTab({ windows, loading }: { windows: PackageAvailability[]; loading: boolean }) {
  if (loading) return <WidgetLoading label="Loading availability…" />;
  if (windows.length === 0) return <p className="text-sm text-muted-foreground">No availability windows configured.</p>;

  return (
    <div className="space-y-4">
      {windows.map((window) => (
        <div key={window.id} className="border border-border rounded-md p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Valid window</span>
            <span className="text-muted-foreground">
              {formatPackageDate(window.validFrom)} → {formatPackageDate(window.validTo)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Capacity per day: </span>
            {window.maxBookingsPerDay ?? "Unlimited"}
          </div>
          <div>
            <span className="text-muted-foreground">Blocked dates: </span>
            {window.blackoutDates.length === 0 ? "None" : window.blackoutDates.join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}

function DaysTab({
  preview,
  loading,
  onRetry,
}: {
  preview: PackagePreview | undefined;
  loading: boolean;
  onRetry: () => void;
}) {
  if (loading) return <WidgetLoading label="Loading days & items…" />;
  if (!preview) return <WidgetError message="Failed to load itinerary" onRetry={onRetry} />;

  if (preview.days.length === 0) {
    return <p className="text-sm text-muted-foreground">No itinerary days yet. Add days in the package builder.</p>;
  }

  return (
    <div className="space-y-4">
      {preview.days.map((day) => (
        <div key={day.id} className="border border-border rounded-md p-4">
          <h4 className="font-medium">
            Day {day.dayNumber}: {day.title}
          </h4>
          {day.description && <p className="text-sm text-muted-foreground mt-1">{day.description}</p>}
          {day.items.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {day.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2 border-t border-border pt-2 first:border-0 first:pt-0">
                  <span>
                    <span className="text-xs uppercase text-muted-foreground">{item.kind}</span> · {item.title}
                  </span>
                  <span className="text-muted-foreground shrink-0">{item.pricingMode}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Preview generated based on your package configuration.</p>
    </div>
  );
}

function PreviewTab({
  preview,
  loading,
  onRetry,
}: {
  preview: PackagePreview | undefined;
  loading: boolean;
  onRetry: () => void;
}) {
  if (loading) return <WidgetLoading label="Loading preview…" />;
  if (!preview) return <WidgetError message="Failed to load preview" onRetry={onRetry} />;

  return (
    <div className="space-y-4 text-sm">
      <div className="border border-border rounded-md p-4">
        <h4 className="font-semibold mb-2">{preview.package.title}</h4>
        <p className="text-muted-foreground">
          {preview.package.durationDays} days · {preview.package.durationNights} nights · {preview.package.status}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Full preview assembled by backend — {preview.days.length} days, pricing{" "}
        {preview.pricing ? "included" : "not set"}, rules {preview.rules ? "included" : "not set"}.
      </p>
      <DaysTab preview={preview} loading={false} onRetry={onRetry} />
    </div>
  );
}

function VersionsTab({
  packageId,
  versions,
  loading,
  currentVersionId,
}: {
  packageId: string;
  versions: PackageVersion[];
  loading: boolean;
  currentVersionId: string | null;
}) {
  const rollbackMutation = useRollbackVersionMutation(packageId);
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  if (loading) return <WidgetLoading label="Loading versions…" />;
  if (versions.length === 0) return <p className="text-sm text-muted-foreground">No published versions yet.</p>;

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {versions.map((version) => (
          <li key={version.id} className="border border-border rounded-md p-4 text-sm">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="font-medium">v{version.versionNumber}</span>
                {version.id === currentVersionId && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current</span>
                )}
                <p className="text-muted-foreground text-xs mt-1">{formatPackageDate(version.publishedAt)}</p>
                {version.changeNote && <p className="mt-1">{version.changeNote}</p>}
              </div>
              <button
                type="button"
                disabled={rollbackMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Rollback to version ${version.versionNumber}?`)) {
                    void rollbackMutation.mutateAsync(version.id);
                  }
                }}
                className="text-xs px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50"
              >
                Rollback
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Version comparison</p>
        <p className="text-xs text-muted-foreground">
          No backend comparison API — select two versions to view snapshot metadata only.
        </p>
        <div className="flex gap-2">
          <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="flex-1 text-xs border border-border rounded px-2 py-1">
            <option value="">Version A</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
          <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="flex-1 text-xs border border-border rounded px-2 py-1">
            <option value="">Version B</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        {compareA && compareB && compareA !== compareB && (
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(
              {
                a: versions.find((v) => v.id === compareA),
                b: versions.find((v) => v.id === compareB),
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
