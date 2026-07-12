"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { EDITABLE_INVENTORY_STATUSES, INVENTORY_KIND_LABELS, InventoryStatus } from "../constants";
import { useArchiveInventoryMutation, useUpdateInventoryMutation } from "../hooks/useInventoryMutations";
import { useInventoryItemQuery } from "../hooks/useInventoryItemQuery";
import { useSuppliersWithHealthQuery } from "../hooks/useSuppliersQuery";
import type { InventoryItem } from "../types";
import { formatDetailsSummary, formatInventoryDate, resolveDestinationName } from "../utils";
import { InventoryStatusBadge } from "./InventoryStatusBadge";
import { KindDetailsFields } from "./KindDetailsFields";

type TabId = "overview" | "details" | "suppliers" | "pricing" | "availability" | "gallery" | "metadata";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "suppliers", label: "Suppliers" },
  { id: "pricing", label: "Pricing" },
  { id: "availability", label: "Availability" },
  { id: "gallery", label: "Gallery" },
  { id: "metadata", label: "Metadata" },
];

interface InventoryDetailDrawerProps {
  itemId: string | null;
  destinations: { id: string; name: string }[];
  onClose: () => void;
}

export function InventoryDetailDrawer({ itemId, destinations, onClose }: InventoryDetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const itemQuery = useInventoryItemQuery(itemId);
  const suppliersQuery = useSuppliersWithHealthQuery();
  const destinationsById = new Map(destinations.map((d) => [d.id, d]));

  if (!itemId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close inventory detail" />
      <div className="relative w-full max-w-2xl h-full bg-white border-l border-border shadow-xl flex flex-col">
        <div className="sticky top-0 z-10 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Inventory Detail</h2>
              <p className="text-xs text-muted-foreground font-mono">{itemId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/inventory/new?id=${itemId}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Open builder <ExternalLink className="h-3 w-3" />
              </Link>
              <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto px-4 gap-1">
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
          {itemQuery.isLoading ? (
            <WidgetLoading label="Loading inventory item…" />
          ) : itemQuery.isError || !itemQuery.data ? (
            <WidgetError message="Failed to load inventory item" onRetry={() => void itemQuery.refetch()} />
          ) : (
            <>
              {tab === "overview" && (
                <OverviewTab item={itemQuery.data} destinationsById={destinationsById} itemId={itemId} />
              )}
              {tab === "details" && (
                <DetailsTab item={itemQuery.data} destinations={destinations} itemId={itemId} />
              )}
              {tab === "suppliers" && (
                <SuppliersTab
                  item={itemQuery.data}
                  suppliers={suppliersQuery.suppliers}
                  healthByCode={suppliersQuery.healthByCode}
                  loading={suppliersQuery.isLoading}
                />
              )}
              {tab === "pricing" && <GapTab label="Pricing" message="No GET /api/inventory/pricing endpoint exists. InventoryItem has no price field." />}
              {tab === "availability" && (
                <GapTab label="Availability" message="No GET /api/inventory/availability endpoint exists. InventoryItem has no availability field." />
              )}
              {tab === "gallery" && (
                <GapTab label="Gallery" message="No gallery field or /api/inventory/:id/gallery endpoint on InventoryItem." />
              )}
              {tab === "metadata" && <MetadataTab item={itemQuery.data} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  item,
  destinationsById,
  itemId,
}: {
  item: InventoryItem;
  destinationsById: Map<string, { id: string; name: string }>;
  itemId: string;
}) {
  const [title, setTitle] = useState(item.title);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const updateMutation = useUpdateInventoryMutation(itemId);
  const archiveMutation = useArchiveInventoryMutation(itemId);
  const editable = EDITABLE_INVENTORY_STATUSES.includes(item.status);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{INVENTORY_KIND_LABELS[item.kind]}</p>
        </div>
        <InventoryStatusBadge status={item.status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Destination</dt>
          <dd className="font-medium">{resolveDestinationName(item.destinationId, destinationsById)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Summary</dt>
          <dd>{formatDetailsSummary(item)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd>{formatInventoryDate(item.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated</dt>
          <dd>{formatInventoryDate(item.updatedAt)}</dd>
        </div>
      </dl>

      {editable && (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm font-medium">Edit title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-md" />
          <button
            type="button"
            disabled={updateMutation.isPending || title === item.title}
            onClick={() => void updateMutation.mutateAsync({ title })}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Save title
          </button>
        </div>
      )}

      {item.status !== InventoryStatus.ARCHIVED && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            disabled={archiveMutation.isPending}
            onClick={() => setIsConfirmingArchive(true)}
            className="px-4 py-2 text-sm border border-amber-300 text-amber-800 rounded-md hover:bg-amber-50 disabled:opacity-50"
          >
            Archive item
          </button>
        </div>
      )}
      {isConfirmingArchive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsConfirmingArchive(false)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Archive Item</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to archive this inventory item? It will no longer be available for new bookings.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsConfirmingArchive(false)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void archiveMutation.mutateAsync();
                  setIsConfirmingArchive(false);
                }}
                className="px-4 py-2 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsTab({
  item,
  destinations,
  itemId,
}: {
  item: InventoryItem;
  destinations: { id: string; name: string }[];
  itemId: string;
}) {
  const [details, setDetails] = useState(item.details);
  const updateMutation = useUpdateInventoryMutation(itemId);

  useEffect(() => {
    setDetails(item.details);
  }, [item.details]);

  return (
    <div className="space-y-4">
      <KindDetailsFields kind={item.kind} details={details} onChange={setDetails} destinations={destinations} />
      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={() => void updateMutation.mutateAsync({ details })}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save details
      </button>
    </div>
  );
}

function SuppliersTab({
  item,
  suppliers,
  healthByCode,
  loading,
}: {
  item: InventoryItem;
  suppliers: ReturnType<typeof useSuppliersWithHealthQuery>["suppliers"];
  healthByCode: ReturnType<typeof useSuppliersWithHealthQuery>["healthByCode"];
  loading: boolean;
}) {
  if (loading) return <WidgetLoading label="Loading suppliers…" />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Platform suppliers from GET /api/suppliers — no per-inventory supplier mapping exists on InventoryItem.
        Item kind: {item.kind}.
      </p>
      <ul className="space-y-3">
        {suppliers.map((supplier) => {
          const health = healthByCode.get(supplier.code);
          return (
            <li key={supplier.id} className="border border-border rounded-md p-4 text-sm">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{supplier.code}</p>
                  <p className="text-xs text-muted-foreground mt-1">Capabilities: {supplier.capabilities.join(", ")}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border border-border">{supplier.status}</span>
              </div>
              {health && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Health: {health.healthy ? "healthy" : "degraded"} — {health.message ?? "—"}
                </p>
              )}
              <p className="text-xs mt-1 text-muted-foreground">Supplier reference: — (not mapped)</p>
              <p className="text-xs text-muted-foreground">Sync status: — (no sync API)</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GapTab({ label, message }: { label: string; message: string }) {
  return (
    <div className="border border-dashed border-border rounded-md p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground mb-2">{label} not available</p>
      <p>{message}</p>
    </div>
  );
}

function MetadataTab({ item }: { item: InventoryItem }) {
  return (
    <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(item, null, 2)}</pre>
  );
}
