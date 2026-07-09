"use client";


import { useFormStatisticsQuery } from "../hooks/useMarketingQueries";
import { MarketingPageShell } from "./MarketingPageShell";

export function FormsPage() {
  const formsQuery = useFormStatisticsQuery();
  const stats = formsQuery.data;

  return (
    <MarketingPageShell
      title="Forms"
      description="Enquiry and quote request statistics derived from existing list APIs."
      isLoading={formsQuery.isLoading}
      isError={formsQuery.isError}
      errorMessage={formsQuery.error instanceof Error ? formsQuery.error.message : undefined}
      isRefreshing={formsQuery.isFetching}
      onRefresh={() => void formsQuery.refetch()}
      onRetry={() => void formsQuery.refetch()}
    >

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Panel title="Enquiry form statistics">
            <dl className="space-y-2 text-sm">
              <Row label="Total submissions" value={String(stats.enquiryTotal)} />
              <Row label="Converted enquiries" value={String(stats.convertedEnquiries)} />
            </dl>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mt-4 mb-2">By type</h4>
            <Breakdown rows={stats.enquiryByType} />
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mt-4 mb-2">By status</h4>
            <Breakdown rows={stats.enquiryByStatus} />
          </Panel>

          <Panel title="Quote request statistics">
            <dl className="space-y-2 text-sm">
              <Row label="Total quotes" value={String(stats.quoteTotal)} />
            </dl>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mt-4 mb-2">By status</h4>
            <Breakdown rows={stats.quoteByStatus} />
          </Panel>
        </div>
      )}
    </MarketingPageShell>
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

function Breakdown({ rows }: { rows: Record<string, number> }) {
  const entries = Object.entries(rows).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {entries.map(([key, count]) => (
        <li key={key} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{key}</span>
          <span className="font-medium">{count}</span>
        </li>
      ))}
    </ul>
  );
}
