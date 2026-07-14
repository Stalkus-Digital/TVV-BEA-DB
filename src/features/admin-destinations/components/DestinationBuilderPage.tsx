"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Globe, HelpCircle, Image as ImageIcon, MapPin, Network } from "lucide-react";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchAllDestinations } from "../api/destinations";
import {
  useAddFaqMutation,
  useAddGalleryImageMutation,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useCreateCategoryMutation,
} from "../hooks/useDestinationMutations";
import { useDestinationQuery } from "../hooks/useDestinationQuery";
import {
  useDestinationBreadcrumbsQuery,
  useDestinationCategoriesQuery,
  useDestinationChildrenQuery,
  useDestinationNearbyQuery,
  useCountriesQuery,
  useStatesQuery,
  useRegionsQuery,
  useCitiesQuery,
} from "../hooks/useDestinationSubQueries";
import { DestinationStatusBadge } from "./DestinationStatusBadge";
import { adminApiClient } from "@/lib/admin-api/client";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { uploadFiles } from "@/lib/admin-api/upload";

const STEPS = [
  { id: 1, name: "Basic Info", icon: MapPin },
  { id: 2, name: "Geography", icon: Globe },
  { id: 3, name: "SEO", icon: Globe },
  { id: 4, name: "Gallery", icon: ImageIcon },
  { id: 5, name: "FAQ", icon: HelpCircle },
];

export function DestinationBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [destinationId, setDestinationId] = useState<string | null>(editId);
  const [currentStep, setCurrentStep] = useState(1);
  const destinationQuery = useDestinationQuery(destinationId);
  const createMutation = useCreateDestinationMutation();
  const updateMutation = useUpdateDestinationMutation(destinationId ?? "");
  const parentOptionsQuery = useQuery({
    queryKey: adminQueryKeys.destinations.all,
    queryFn: () => fetchAllDestinations(),
    staleTime: 5 * 60 * 1000,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [parentDestinationId, setParentDestinationId] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const categoriesQuery = useDestinationCategoriesQuery();
  const countriesQuery = useCountriesQuery();
  const statesQuery = useStatesQuery(countryId || undefined);
  const regionsQuery = useRegionsQuery(countryId || undefined);
  const citiesQuery = useCitiesQuery(countryId || undefined, stateId || undefined);

  useEffect(() => {
    if (editId) setDestinationId(editId);
  }, [editId]);

  useEffect(() => {
    if (destinationQuery.data) {
      const d = destinationQuery.data;
      setName(d.name);
      setSlug(d.slug);
      setDescription(d.description ?? "");
      setCountryId(d.countryId);
      setStateId(d.stateId ?? "");
      setRegionId(d.regionId ?? "");
      setCityId(d.cityId ?? "");
      setParentDestinationId(d.parentDestinationId ?? "");
      setCategoryIds(d.categoryIds);
    }
  }, [destinationQuery.data]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCreate = async () => {
    const created = await createMutation.mutateAsync({
      name,
      slug: slug || undefined,
      countryId,
      stateId: stateId || null,
      cityId: cityId || null,
      regionId: regionId || null,
      parentDestinationId: parentDestinationId || null,
      categoryIds,
      description: description || null,
    });
    setDestinationId(created.id);
    router.replace(`/destinations/new?id=${created.id}`);
    nextStep();
  };

  const handleUpdate = async () => {
    if (!destinationId) return;
    await updateMutation.mutateAsync({
      name,
      categoryIds,
      description: description || null,
    });
  };

  const canCreate = name.trim().length > 0;

  // geoQuery removed, rely on individual queries in the steps
  const parentOptions =
    parentOptionsQuery.data
      ?.filter((d) => d.id !== destinationId)
      .map((d) => ({ id: d.id, name: d.name })) ?? [];

  return (
    <div className="flex h-full bg-background rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="w-64 border-r border-border bg-card shrink-0 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <Link href="/destinations" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to destinations
          </Link>
          <h2 className="font-semibold text-lg tracking-tight mt-2">
            {destinationId ? "Edit Destination" : "Add Destination"}
          </h2>
          {destinationQuery.data && (
            <div className="mt-2">
              <DestinationStatusBadge status={destinationQuery.data.status} />
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
              <BasicStep
                name={name}
                slug={slug}
                description={description}
                onNameChange={setName}
                onSlugChange={setSlug}
                onDescriptionChange={setDescription}
                destinationId={destinationId}
                categoryIds={categoryIds}
                categories={categoriesQuery.data ?? []}
                isLoadingCategories={categoriesQuery.isLoading}
                onCategoryChange={setCategoryIds}
              />
            )}
            {currentStep === 2 && (
              <GeographyStep
                countryId={countryId}
                stateId={stateId}
                regionId={regionId}
                cityId={cityId}
                onCountryChange={(id) => {
                  setCountryId(id);
                  setStateId("");
                  setRegionId("");
                  setCityId("");
                }}
                onStateChange={(id) => {
                  setStateId(id);
                  setCityId("");
                }}
                onRegionChange={setRegionId}
                onCityChange={setCityId}
                countries={countriesQuery.data ?? []}
                states={statesQuery.data ?? []}
                regions={regionsQuery.data ?? []}
                cities={citiesQuery.data ?? []}
                isLoading={{
                  countries: countriesQuery.isLoading,
                  states: statesQuery.isLoading,
                  regions: regionsQuery.isLoading,
                  cities: citiesQuery.isLoading,
                }}
                locked={Boolean(destinationId)}
                parentDestinationId={parentDestinationId}
                onParentChange={setParentDestinationId}
                parentOptions={parentOptions}
              />
            )}
            {currentStep === 3 && destinationId && <SeoBuilderStep destinationId={destinationId} />}
            {currentStep === 3 && !destinationId && <p className="text-sm text-muted-foreground">Create the destination first.</p>}
            {currentStep === 4 && destinationId && <GalleryBuilderStep destinationId={destinationId} />}
            {currentStep === 4 && !destinationId && <p className="text-sm text-muted-foreground">Create the destination first.</p>}
            {currentStep === 5 && destinationId && <FaqBuilderStep destinationId={destinationId} />}
            {currentStep === 5 && !destinationId && <p className="text-sm text-muted-foreground">Create the destination first.</p>}
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
            {!destinationId && currentStep <= 2 && (
              <button
                type="button"
                disabled={createMutation.isPending || !canCreate || !countryId}
                onClick={() => void handleCreate()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create & continue"}
              </button>
            )}
            {destinationId && currentStep <= 2 && (
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => void handleUpdate()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </button>
            )}
            {currentStep < STEPS.length && (
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={!destinationId && currentStep >= 2}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                Next
              </button>
            )}
            {currentStep === STEPS.length && (
              <button 
                type="button" 
                onClick={() => router.push("/destinations")}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicStep({
  name,
  slug,
  description,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  destinationId,
  categoryIds,
  categories,
  isLoadingCategories,
  onCategoryChange,
}: {
  name: string;
  slug: string;
  description: string;
  onNameChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  destinationId: string | null;
  categoryIds: string[];
  categories: { id: string; name: string }[];
  isLoadingCategories?: boolean;
  onCategoryChange: (ids: string[]) => void;
}) {
  const updateMutation = useUpdateDestinationMutation(destinationId ?? "");
  const createCategoryMutation = useCreateCategoryMutation();
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const category = await createCategoryMutation.mutateAsync({ name: newCategoryName.trim(), slug });
      onCategoryChange([...categoryIds, category.id]);
      setNewCategoryName("");
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to create category");
    }
  };

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium mb-1">Destination name *</label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
          placeholder="Havelock Island"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">SEO slug</label>
        <div className="flex items-center gap-1 border border-border rounded-md px-3 py-2">
          <span className="text-muted-foreground text-sm">/destinations/</span>
          <input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            disabled={Boolean(destinationId)}
            className="flex-1 bg-transparent border-none p-0 text-sm font-mono disabled:opacity-60"
            placeholder="havelock-island"
          />
        </div>
        {destinationId && <p className="text-xs text-muted-foreground mt-1">Slug is fixed after creation.</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Categories
          {isLoadingCategories && <span className="ml-2 text-xs text-muted-foreground">Loading…</span>}
        </label>
        {!isLoadingCategories && categories.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No categories found. Create destination categories first.</p>
        )}
        {categories.length > 0 && (
          <div className="border border-border rounded-md p-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={categoryIds.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onCategoryChange([...categoryIds, c.id]);
                    } else {
                      onCategoryChange(categoryIds.filter((id) => id !== c.id));
                    }
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
        {categoryIds.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{categoryIds.length} selected</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3 py-1 border border-border rounded-md text-sm"
            placeholder="New Category Name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleCreateCategory();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void handleCreateCategory()}
            disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md disabled:opacity-50 border border-border"
          >
            {createCategoryMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
      {destinationId && (
        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => void updateMutation.mutateAsync({ name, description: description || null, categoryIds })}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Save basic info
        </button>
      )}
    </div>
  );
}

function GeographyStep({
  countryId,
  stateId,
  regionId,
  cityId,
  onCountryChange,
  onStateChange,
  onRegionChange,
  onCityChange,
  countries,
  states,
  regions,
  cities,
  isLoading,
  locked,
  parentDestinationId,
  onParentChange,
  parentOptions,
}: {
  countryId: string;
  stateId: string;
  regionId: string;
  cityId: string;
  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onRegionChange: (id: string) => void;
  onCityChange: (id: string) => void;
  countries: { id: string; name: string }[];
  states: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  isLoading: { countries: boolean; states: boolean; regions: boolean; cities: boolean };
  locked: boolean;
  parentDestinationId: string;
  onParentChange: (id: string) => void;
  parentOptions: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium mb-1 flex justify-between items-center">
          Country (Optional)
          {isLoading.countries && <span className="text-xs text-muted-foreground">Loading...</span>}
        </label>
        <select
          value={countryId}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={locked || isLoading.countries}
          className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
        >
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 flex justify-between items-center">
            State
            {isLoading.states && <span className="text-xs text-muted-foreground">Loading...</span>}
          </label>
          <select
            value={stateId}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={locked || isLoading.states || !countryId}
            className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex justify-between items-center">
            Region
            {isLoading.regions && <span className="text-xs text-muted-foreground">Loading...</span>}
          </label>
          <select
            value={regionId}
            onChange={(e) => onRegionChange(e.target.value)}
            disabled={locked || isLoading.regions || !countryId}
            className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
          >
            <option value="">Select region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 flex justify-between items-center">
          City
          {isLoading.cities && <span className="text-xs text-muted-foreground">Loading...</span>}
        </label>
        <select
          value={cityId}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={locked || isLoading.cities || (!countryId && !stateId)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm disabled:opacity-60"
        >
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {!locked && (
        <div>
          <label className="block text-sm font-medium mb-1">Parent destination (optional)</label>
          <select
            value={parentDestinationId}
            onChange={(e) => onParentChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">None (Top-level destination)</option>
            {parentOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">Set at create only — hierarchy from backend.</p>
        </div>
      )}
      {locked && (
        <p className="text-xs text-muted-foreground">Geography fields are fixed after creation — no PATCH support.</p>
      )}
    </div>
  );
}

function HierarchyStep({ destinationId }: { destinationId: string }) {
  const breadcrumbsQuery = useDestinationBreadcrumbsQuery(destinationId);
  const childrenQuery = useDestinationChildrenQuery(destinationId);
  const nearbyQuery = useDestinationNearbyQuery(destinationId);

  if (breadcrumbsQuery.isLoading) return <WidgetLoading label="Loading hierarchy…" />;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-2">Breadcrumb trail</h3>
        <p className="text-sm">{breadcrumbsQuery.data?.map((b) => b.name).join(" → ") ?? "—"}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-2">Children ({childrenQuery.data?.length ?? 0})</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {childrenQuery.data?.map((c) => (
            <li key={c.id}>
              {c.name} <span className="font-mono text-xs">({c.slug})</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-2">Nearby ({nearbyQuery.data?.length ?? 0})</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {nearbyQuery.data?.map((d) => (
            <li key={d.id}>
              {d.name} <span className="font-mono text-xs">({d.slug})</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-2">Calculated automatically based on geography.</p>
      </div>
    </div>
  );
}

function SeoBuilderStep({ destinationId }: { destinationId: string }) {
  const destinationQuery = useDestinationQuery(destinationId);
  const updateMutation = useUpdateDestinationMutation(destinationId);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (destinationQuery.data) {
      setMetaTitle(destinationQuery.data.seo.metaTitle ?? "");
      setMetaDescription(destinationQuery.data.seo.metaDescription ?? "");
    }
  }, [destinationQuery.data]);

  if (destinationQuery.isLoading) return <WidgetLoading label="Loading…" />;

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <input
        value={metaTitle}
        onChange={(e) => setMetaTitle(e.target.value)}
        placeholder="Meta title"
        className="w-full px-3 py-2 border border-border rounded-md text-sm"
      />
      <textarea
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        placeholder="Meta description"
        rows={3}
        className="w-full px-3 py-2 border border-border rounded-md text-sm"
      />
      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={() =>
          void updateMutation.mutateAsync({
            seo: { ...destinationQuery.data?.seo, metaTitle, metaDescription },
          })
        }
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save SEO
      </button>
    </div>
  );
}

function GalleryBuilderStep({ destinationId }: { destinationId: string }) {
  const destinationQuery = useDestinationQuery(destinationId);
  const addMutation = useAddGalleryImageMutation(destinationId);
  const [isUploading, setIsUploading] = useState(false);

  if (destinationQuery.isLoading) return <WidgetLoading label="Loading…" />;

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <p className="text-xs text-muted-foreground">Upload images to gallery.</p>
      <ImageUploader 
        label=""
        multiple={false}
        value={[]}
        onChange={async (urls) => {
          if (urls && urls.length > 0) {
            try {
              setIsUploading(true);
              const file = urls[0];
              if (typeof file === "string") {
                 await addMutation.mutateAsync({ url: file });
              } else {
                 const results = await uploadFiles([file], "GALLERY_IMAGE");
                 if (results.length > 0) {
                    await addMutation.mutateAsync({ url: results[0].url });
                 }
              }
            } catch (err) {
              console.error("Failed to upload image", err);
              alert("Failed to upload image");
            } finally {
              setIsUploading(false);
            }
          }
        }}
      />
      {isUploading && <p className="text-sm text-muted-foreground animate-pulse">Uploading...</p>}

      {destinationQuery.data?.gallery && destinationQuery.data.gallery.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {destinationQuery.data.gallery.map((img) => (
            <div key={img.id} className="relative aspect-video bg-muted rounded-md overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Gallery image" className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-4">{destinationQuery.data?.gallery.length ?? 0} images in gallery.</p>
    </div>
  );
}

function FaqBuilderStep({ destinationId }: { destinationId: string }) {
  const destinationQuery = useDestinationQuery(destinationId);
  const addMutation = useAddFaqMutation(destinationId);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  if (destinationQuery.isLoading) return <WidgetLoading label="Loading…" />;

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-6">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full px-3 py-2 border border-border rounded-md text-sm"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        rows={2}
        className="w-full px-3 py-2 border border-border rounded-md text-sm"
      />
      <button
        type="button"
        disabled={addMutation.isPending || !question.trim() || !answer.trim()}
        onClick={() => void addMutation.mutateAsync({ question, answer }).then(() => { setQuestion(""); setAnswer(""); })}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Add FAQ
      </button>

      {destinationQuery.data?.faqs && destinationQuery.data.faqs.length > 0 && (
        <div className="mt-6 space-y-3">
          {destinationQuery.data.faqs.map((faq) => (
            <div key={faq.id} className="p-4 border border-border rounded-md bg-background/50">
              <h4 className="font-medium text-sm">{faq.question}</h4>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-4">{destinationQuery.data?.faqs.length ?? 0} FAQs.</p>
    </div>
  );
}
