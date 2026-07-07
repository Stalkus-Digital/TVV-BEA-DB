"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Database, MapPin, Package, Truck } from "lucide-react";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { fetchCountries } from "@/features/admin-destinations/api/destinations";
import { fetchAllDestinations } from "@/features/admin-destinations/api/destinations";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { INVENTORY_KINDS, INVENTORY_KIND_LABELS, InventoryKind } from "../constants";
import { useCreateInventoryMutation, useUpdateInventoryMutation } from "../hooks/useInventoryMutations";
import { useInventoryItemQuery } from "../hooks/useInventoryItemQuery";
import { useSuppliersWithHealthQuery } from "../hooks/useSuppliersQuery";
import { defaultDetailsForKind } from "../utils";
import type { InventoryItem } from "../types";
import { InventoryStatusBadge } from "./InventoryStatusBadge";
import { KindDetailsFields } from "./KindDetailsFields";

const STEPS = [
  { id: 1, name: "Basic Info", icon: Package },
  { id: 2, name: "Details", icon: Database },
  { id: 3, name: "Suppliers", icon: Truck },
  { id: 4, name: "Metadata", icon: MapPin },
];

export function InventoryBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [itemId, setItemId] = useState<string | null>(editId);
  const [currentStep, setCurrentStep] = useState(1);

  const itemQuery = useInventoryItemQuery(itemId);
  const createMutation = useCreateInventoryMutation();
  const destinationsQuery = useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: () => fetchAllDestinations(),
    staleTime: 5 * 60 * 1000,
  });
  const countriesQuery = useQuery({
    queryKey: adminQueryKeys.destinations.geography.countries,
    queryFn: fetchCountries,
    staleTime: 5 * 60 * 1000,
  });
  const suppliersQuery = useSuppliersWithHealthQuery();

  const [kind, setKind] = useState<InventoryKind>(InventoryKind.HOTEL);
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [details, setDetails] = useState<InventoryItem["details"]>(defaultDetailsForKind(InventoryKind.HOTEL));

  useEffect(() => {
    if (editId) setItemId(editId);
  }, [editId]);

  useEffect(() => {
    if (itemQuery.data) {
      setKind(itemQuery.data.kind);
      setTitle(itemQuery.data.title);
      setDestinationId(itemQuery.data.destinationId ?? "");
      setDetails(itemQuery.data.details);
    }
  }, [itemQuery.data]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCreate = async () => {
    const created = await createMutation.mutateAsync({
      kind,
      title,
      destinationId: destinationId || null,
      details,
    });
    setItemId(created.id);
    router.replace(`/inventory/new?id=${created.id}`);
    nextStep();
  };

  const destinations = destinationsQuery.data ?? [];
  const countries = countriesQuery.data ?? [];

  if (destinationsQuery.isLoading) {
    return <WidgetLoading label="Loading destinations…" />;
  }

  return (
    <div className="flex h-full bg-background rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="w-64 border-r border-border bg-card shrink-0 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <Link href="/inventory" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to inventory
          </Link>
          <h2 className="font-semibold text-lg tracking-tight mt-2">{itemId ? "Edit Inventory" : "Add Inventory"}</h2>
          {itemQuery.data && (
            <div className="mt-2">
              <InventoryStatusBadge status={itemQuery.data.status} />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 w-full text-left transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : isActive ? (
                  <Circle className="h-5 w-5 fill-primary/20 text-primary" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50/50">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight mb-6">{STEPS.find((s) => s.id === currentStep)?.name}</h1>

            {currentStep === 1 && (
              <div className="space-y-4 bg-card border border-border rounded-lg p-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Inventory type *</label>
                  <select
                    value={kind}
                    onChange={(e) => {
                      const nextKind = e.target.value as InventoryKind;
                      setKind(nextKind);
                      if (!itemId) setDetails(defaultDetailsForKind(nextKind, countries[0]?.id));
                    }}
                    disabled={Boolean(itemId)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
                  >
                    {INVENTORY_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {INVENTORY_KIND_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="Symphony Palms Beach Resort"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination</label>
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="">None</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                {itemId ? (
                  <EditDetailsStep itemId={itemId} kind={kind} details={details} destinations={destinations} countries={countries} />
                ) : (
                  <KindDetailsFields
                    kind={kind}
                    details={details}
                    onChange={setDetails}
                    destinations={destinations}
                    countries={countries}
                  />
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Registered suppliers — no inventory-to-supplier mapping API. TripJack shows placeholder health when not configured.
                </p>
                {suppliersQuery.suppliers.map((supplier) => {
                  const health = suppliersQuery.healthByCode.get(supplier.code);
                  return (
                    <div key={supplier.id} className="border border-border rounded-md p-4 bg-card text-sm">
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.code} · {supplier.status}</p>
                      {health && <p className="text-xs mt-1">{health.healthy ? "Healthy" : "Degraded"}: {health.message ?? "—"}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {currentStep === 4 && itemQuery.data && (
              <pre className="text-xs bg-card border border-border p-4 rounded-md overflow-auto">{JSON.stringify(itemQuery.data, null, 2)}</pre>
            )}
            {currentStep === 4 && !itemQuery.data && (
              <p className="text-sm text-muted-foreground">Create the item first to view metadata.</p>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-card px-6 py-4 flex justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-40">
            Previous
          </button>
          <div className="flex gap-2">
            {!itemId && currentStep <= 2 && (
              <button
                type="button"
                disabled={createMutation.isPending || !title.trim()}
                onClick={() => void handleCreate()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create & continue"}
              </button>
            )}
            {currentStep < STEPS.length && (
              <button type="button" onClick={nextStep} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditDetailsStep({
  itemId,
  kind,
  details,
  destinations,
  countries,
}: {
  itemId: string;
  kind: InventoryKind;
  details: InventoryItem["details"];
  destinations: { id: string; name: string }[];
  countries: { id: string; name: string }[];
}) {
  const [localDetails, setLocalDetails] = useState(details);
  const updateMutation = useUpdateInventoryMutation(itemId);

  useEffect(() => setLocalDetails(details), [details]);

  return (
    <>
      <KindDetailsFields kind={kind} details={localDetails} onChange={setLocalDetails} destinations={destinations} countries={countries} />
      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={() => void updateMutation.mutateAsync({ details: localDetails })}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save details
      </button>
    </>
  );
}
