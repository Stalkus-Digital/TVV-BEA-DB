"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  DollarSign,
  Eye,
  Image as ImageIcon,
  ListChecks,
  MapPin,
} from "lucide-react";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { PackageSourceType } from "../constants";
import {
  useAddAvailabilityMutation,
  useAddDayMutation,
  useAddItemMutation,
  useCreatePackageMutation,
  usePublishPackageMutation,
  useUpdatePackageMutation,
  useUpsertPricingMutation,
  useUpsertRulesMutation,
} from "../hooks/usePackageMutations";
import { usePackageQuery } from "../hooks/usePackageQuery";
import { usePackageComputeQuery, usePackagePreviewQuery } from "../hooks/usePackageSubQueries";
import { formatPackageMoney } from "../utils";
import { PackageStatusBadge } from "./PackageStatusBadge";

const STEPS = [
  { id: 1, name: "Basic Info", icon: MapPin },
  { id: 2, name: "Destination", icon: MapPin },
  { id: 3, name: "Itinerary Builder", icon: CalendarDays },
  { id: 4, name: "Pricing", icon: DollarSign },
  { id: 5, name: "Inclusions", icon: ListChecks },
  { id: 6, name: "Media", icon: ImageIcon },
  { id: 7, name: "Preview", icon: Eye },
];

export function PackageBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [packageId, setPackageId] = useState<string | null>(editId);
  const [currentStep, setCurrentStep] = useState(1);

  const destinationsQuery = useDestinationsQuery();
  const packageQuery = usePackageQuery(packageId);
  const previewQuery = usePackagePreviewQuery(packageId);
  const createMutation = useCreatePackageMutation();

  const [title, setTitle] = useState("");
  const [durationDays, setDurationDays] = useState(5);
  const [durationNights, setDurationNights] = useState(4);
  const [destinationId, setDestinationId] = useState("");
  const [sourceType, setSourceType] = useState<PackageSourceType>(PackageSourceType.MANUAL);

  useEffect(() => {
    if (editId) setPackageId(editId);
  }, [editId]);

  useEffect(() => {
    if (packageQuery.data) {
      setTitle(packageQuery.data.title);
      setDurationDays(packageQuery.data.durationDays);
      setDurationNights(packageQuery.data.durationNights);
      setDestinationId(packageQuery.data.destinationId);
    }
  }, [packageQuery.data]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCreate = async () => {
    const created = await createMutation.mutateAsync({
      title,
      destinationId,
      durationDays,
      durationNights,
      sourceType,
    });
    setPackageId(created.id);
    router.replace(`/packages/new?id=${created.id}`);
    nextStep();
  };

  const canProceedFromBasic = title.trim().length > 0 && durationDays > 0;
  const canProceedFromDestination = Boolean(destinationId);

  return (
    <div className="flex h-full bg-background rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="w-64 border-r border-border bg-card shrink-0 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <Link href="/packages" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to packages
          </Link>
          <h2 className="font-semibold text-lg tracking-tight mt-2">{packageId ? "Edit Package" : "Create Package"}</h2>
          <p className="text-xs text-muted-foreground">Follow the steps to build.</p>
          {packageQuery.data && (
            <div className="mt-2">
              <PackageStatusBadge status={packageQuery.data.status} />
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
              <BasicInfoStep
                title={title}
                durationDays={durationDays}
                durationNights={durationNights}
                sourceType={sourceType}
                onTitleChange={setTitle}
                onDurationDaysChange={setDurationDays}
                onDurationNightsChange={setDurationNights}
                onSourceTypeChange={setSourceType}
                packageId={packageId}
              />
            )}
            {currentStep === 2 && (
              <DestinationStep
                destinationId={destinationId}
                destinations={destinationsQuery.data ?? []}
                loading={destinationsQuery.isLoading}
                onDestinationChange={setDestinationId}
                locked={Boolean(packageId)}
              />
            )}
            {currentStep === 3 && packageId && (
              <ItineraryStep packageId={packageId} preview={previewQuery.data} loading={previewQuery.isLoading} />
            )}
            {currentStep === 3 && !packageId && (
              <p className="text-sm text-muted-foreground">Complete Basic Info and Destination, then create the package.</p>
            )}
            {currentStep === 4 && packageId && <PricingStep packageId={packageId} />}
            {currentStep === 4 && !packageId && <p className="text-sm text-muted-foreground">Create the package first.</p>}
            {currentStep === 5 && packageId && <RulesStep packageId={packageId} />}
            {currentStep === 5 && !packageId && <p className="text-sm text-muted-foreground">Create the package first.</p>}
            {currentStep === 6 && <AvailabilityStep packageId={packageId} preview={previewQuery.data} />}
            {currentStep === 7 && packageId && (
              <PreviewStep
                packageId={packageId}
                preview={previewQuery.data}
                loading={previewQuery.isLoading}
                onRetry={() => void previewQuery.refetch()}
              />
            )}
            {currentStep === 7 && !packageId && <p className="text-sm text-muted-foreground">Create the package first.</p>}
          </div>
        </div>

        <div className="border-t border-border bg-card px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {!packageId && currentStep <= 2 && (
              <button
                type="button"
                disabled={createMutation.isPending || !canProceedFromBasic || !canProceedFromDestination}
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

function BasicInfoStep({
  title,
  durationDays,
  durationNights,
  sourceType,
  onTitleChange,
  onDurationDaysChange,
  onDurationNightsChange,
  onSourceTypeChange,
  packageId,
}: {
  title: string;
  durationDays: number;
  durationNights: number;
  sourceType: PackageSourceType;
  onTitleChange: (v: string) => void;
  onDurationDaysChange: (v: number) => void;
  onDurationNightsChange: (v: number) => void;
  onSourceTypeChange: (v: PackageSourceType) => void;
  packageId: string | null;
}) {
  const updateMutation = useUpdatePackageMutation(packageId ?? "");

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium mb-1">Package title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
          placeholder="Andaman Explorer 5N6D"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Source (Provider)</label>
        <select
          value={sourceType}
          onChange={(e) => onSourceTypeChange(e.target.value as PackageSourceType)}
          disabled={Boolean(packageId)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
        >
          <option value="MANUAL">Manual Entry</option>
          <option value="TRIPJACK">TripJack Sync</option>
          <option value="SEMBARK">Sembark Sync</option>
          <option value="SUPPLIER">Other Supplier</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Duration (days)</label>
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => onDurationDaysChange(Number(e.target.value))}
            disabled={Boolean(packageId)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nights</label>
          <input
            type="number"
            min={0}
            value={durationNights}
            onChange={(e) => onDurationNightsChange(Number(e.target.value))}
            disabled={Boolean(packageId)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
          />
        </div>
      </div>
      {packageId && (
        <>
          <p className="text-xs text-muted-foreground">Duration is fixed after creation — PATCH only supports title and SEO.</p>
          <button
            type="button"
            disabled={updateMutation.isPending || !packageId}
            onClick={() => void updateMutation.mutateAsync({ title })}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Save title
          </button>
        </>
      )}
    </div>
  );
}

function DestinationStep({
  destinationId,
  destinations,
  loading,
  onDestinationChange,
  locked,
}: {
  destinationId: string;
  destinations: { id: string; name: string }[];
  loading: boolean;
  onDestinationChange: (id: string) => void;
  locked: boolean;
}) {
  if (loading) return <WidgetLoading label="Loading destinations…" />;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <label className="block text-sm font-medium">Primary destination</label>
      <select
        value={destinationId}
        onChange={(e) => onDestinationChange(e.target.value)}
        disabled={locked}
        className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
      >
        <option value="">Select destination</option>
        {destinations.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {locked && <p className="text-xs text-muted-foreground">Destination cannot be changed after package creation.</p>}
    </div>
  );
}

function ItineraryStep({
  packageId,
  preview,
  loading,
}: {
  packageId: string;
  preview: ReturnType<typeof usePackagePreviewQuery>["data"];
  loading: boolean;
}) {
  const addDayMutation = useAddDayMutation(packageId);
  const addItemMutation = useAddItemMutation(packageId);
  const [dayNumber, setDayNumber] = useState(1);
  const [dayTitle, setDayTitle] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");

  const days = preview?.days ?? [];

  useEffect(() => {
    if (days.length > 0 && !selectedDayId) setSelectedDayId(days[0].id);
  }, [days, selectedDayId]);

  if (loading) return <WidgetLoading label="Loading itinerary…" />;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm">Add day</h3>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min={1}
            value={dayNumber}
            onChange={(e) => setDayNumber(Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-md text-sm"
            placeholder="Day #"
          />
          <input
            value={dayTitle}
            onChange={(e) => setDayTitle(e.target.value)}
            className="col-span-2 px-3 py-2 border border-border rounded-md text-sm"
            placeholder="Day title"
          />
        </div>
        <button
          type="button"
          disabled={addDayMutation.isPending || !dayTitle.trim()}
          onClick={() => void addDayMutation.mutateAsync({ dayNumber, title: dayTitle })}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Add day
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm">Add item (MEALS — no inventory ref required)</h3>
        <select
          value={selectedDayId}
          onChange={(e) => setSelectedDayId(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        >
          <option value="">Select day</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              Day {d.dayNumber}: {d.title}
            </option>
          ))}
        </select>
        <input
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
          placeholder="Item title"
        />
        <button
          type="button"
          disabled={addItemMutation.isPending || !selectedDayId || !itemTitle.trim()}
          onClick={() =>
            void addItemMutation.mutateAsync({
              dayId: selectedDayId,
              input: { kind: "MEALS", title: itemTitle, resolutionMode: "PINNED", pricingMode: "INCLUDED" },
            })
          }
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Add item
        </button>
      </div>

      {days.map((day) => (
        <div key={day.id} className="border border-border rounded-md p-4 bg-card text-sm">
          <p className="font-medium">
            Day {day.dayNumber}: {day.title}
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {day.items.map((item) => (
              <li key={item.id}>
                {item.kind} · {item.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PricingStep({ packageId }: { packageId: string }) {
  const upsertMutation = useUpsertPricingMutation(packageId);
  const computeQuery = usePackageComputeQuery(packageId);
  const [basePrice, setBasePrice] = useState(45000);
  const [currency, setCurrency] = useState("INR");
  const [markupType, setMarkupType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [markupValue, setMarkupValue] = useState(0);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">("FLAT");
  const [discountValue, setDiscountValue] = useState(0);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Base price</label>
          <input
            type="number"
            min={0}
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Markup type</label>
          <select
            value={markupType}
            onChange={(e) => setMarkupType(e.target.value as "PERCENTAGE" | "FLAT")}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Markup value</label>
          <input
            type="number"
            min={0}
            value={markupValue}
            onChange={(e) => setMarkupValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount type</label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FLAT")}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount value</label>
          <input
            type="number"
            min={0}
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>
      <button
        type="button"
        disabled={upsertMutation.isPending}
        onClick={() =>
          void upsertMutation.mutateAsync({
            basePrice,
            currency,
            markup: markupValue > 0 ? { type: markupType, value: markupValue } : null,
            discount: discountValue > 0 ? { type: discountType, value: discountValue } : null,
            tax: null,
          })
        }
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save pricing
      </button>
      {computeQuery.data && (
        <div className="border border-border rounded-md p-4 text-sm">
          <p className="font-medium">Backend computed total (2 adults)</p>
          <p className="text-lg font-semibold mt-1">{formatPackageMoney(computeQuery.data.total, computeQuery.data.currency)}</p>
        </div>
      )}
    </div>
  );
}

function RulesStep({ packageId }: { packageId: string }) {
  const upsertMutation = useUpsertRulesMutation(packageId);
  const [minPax, setMinPax] = useState(2);
  const [maxPax, setMaxPax] = useState<number | "">(10);
  const [refundPolicy, setRefundPolicy] = useState("Standard cancellation policy applies.");

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min pax</label>
          <input
            type="number"
            min={1}
            value={minPax}
            onChange={(e) => setMinPax(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max pax</label>
          <input
            type="number"
            min={minPax}
            value={maxPax}
            onChange={(e) => setMaxPax(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Refund policy</label>
        <textarea
          value={refundPolicy}
          onChange={(e) => setRefundPolicy(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
      <button
        type="button"
        disabled={upsertMutation.isPending}
        onClick={() =>
          void upsertMutation.mutateAsync({
            minPax,
            maxPax: maxPax === "" ? null : maxPax,
            refundPolicy,
            cancellationTiers: [],
            paymentTerms: null,
            bookingWindow: null,
          })
        }
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save rules
      </button>
    </div>
  );
}

function AvailabilityStep({
  packageId,
  preview,
}: {
  packageId: string | null;
  preview: ReturnType<typeof usePackagePreviewQuery>["data"];
}) {
  const addMutation = useAddAvailabilityMutation(packageId ?? "");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [maxBookings, setMaxBookings] = useState<number | "">("");
  const [blackout, setBlackout] = useState("");

  if (!packageId) {
    return (
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Create the package first to configure availability windows.</p>
        <p className="text-xs">Item images are managed via itinerary item `images[]` — no package-level media API.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 space-y-3">
        <h3 className="font-medium text-sm">Add availability window</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="px-3 py-2 border border-border rounded-md text-sm" />
          <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="px-3 py-2 border border-border rounded-md text-sm" />
        </div>
        <input
          type="number"
          min={1}
          placeholder="Max bookings per day (optional)"
          value={maxBookings}
          onChange={(e) => setMaxBookings(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <input
          value={blackout}
          onChange={(e) => setBlackout(e.target.value)}
          placeholder="Blackout dates (comma-separated YYYY-MM-DD)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          type="button"
          disabled={addMutation.isPending || !validFrom || !validTo}
          onClick={() =>
            void addMutation.mutateAsync({
              validFrom: new Date(validFrom).toISOString(),
              validTo: new Date(validTo).toISOString(),
              maxBookingsPerDay: maxBookings === "" ? null : maxBookings,
              blackoutDates: blackout
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean)
                .map((d) => new Date(d).toISOString()),
            })
          }
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Add window
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Media step maps to item-level images in itinerary — {preview?.days.reduce((n, d) => n + d.items.length, 0) ?? 0} items in preview.
      </p>
    </div>
  );
}

function PreviewStep({
  packageId,
  preview,
  loading,
  onRetry,
}: {
  packageId: string;
  preview: ReturnType<typeof usePackagePreviewQuery>["data"];
  loading: boolean;
  onRetry: () => void;
}) {
  const publishMutation = usePublishPackageMutation(packageId);
  const [changeNote, setChangeNote] = useState("");

  if (loading) return <WidgetLoading label="Loading preview…" />;
  if (!preview) return <WidgetError message="Failed to load preview" onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold">{preview.package.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {preview.package.durationDays}D / {preview.package.durationNights}N · {preview.days.length} days ·{" "}
          {preview.pricing ? formatPackageMoney(preview.pricing.basePrice, preview.pricing.currency) + " base" : "No pricing"}
        </p>
        <PackageStatusBadge status={preview.package.status} />
      </div>
      {preview.package.status === "DRAFT" && (
        <div className="space-y-2">
          <input
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="Change note for publish"
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
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
      <p className="text-xs text-muted-foreground">Preview generated based on your package configuration.</p>
    </div>
  );
}
