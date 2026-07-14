"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ExternalLink, X } from "lucide-react";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { uploadFiles } from "@/lib/admin-api/upload";
import { DestinationStatus, EDITABLE_DESTINATION_STATUSES } from "../constants";
import {
  useAddFaqMutation,
  useAddGalleryImageMutation,
  useArchiveDestinationMutation,
  useRemoveFaqMutation,
  useRemoveGalleryImageMutation,
  useUpdateDestinationMutation,
} from "../hooks/useDestinationMutations";
import { useDestinationQuery } from "../hooks/useDestinationQuery";
import {
  useDestinationBreadcrumbsQuery,
  useDestinationChildrenQuery,
  useDestinationNearbyQuery,
} from "../hooks/useDestinationSubQueries";
import type { Destination, DestinationBreadcrumb } from "../types";
import { formatDestinationDate, resolveCategoryLabel, resolveGeoName } from "../utils";
import { DestinationStatusBadge } from "./DestinationStatusBadge";
import type { useGeographyReferenceQuery } from "../hooks/useDestinationsQuery";

type GeoReference = NonNullable<ReturnType<typeof useGeographyReferenceQuery>["data"]>;

type TabId = "overview" | "hierarchy" | "nearby" | "seo" | "gallery" | "faq";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "hierarchy", label: "Hierarchy" },
  { id: "nearby", label: "Nearby" },
  { id: "seo", label: "SEO" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
];

interface DestinationDetailDrawerProps {
  destinationId: string | null;
  geo?: GeoReference;
  onClose: () => void;
  onSelectDestination?: (id: string) => void;
}

export function DestinationDetailDrawer({
  destinationId,
  geo,
  onClose,
  onSelectDestination,
}: DestinationDetailDrawerProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const destinationQuery = useDestinationQuery(destinationId);
  const breadcrumbsQuery = useDestinationBreadcrumbsQuery(destinationId);
  const childrenQuery = useDestinationChildrenQuery(destinationId);
  const nearbyQuery = useDestinationNearbyQuery(destinationId);

  if (!destinationId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close destination detail" />
      <div className="relative w-full max-w-2xl h-full bg-white border-l border-border shadow-xl flex flex-col">
        <div className="sticky top-0 z-10 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Destination Detail</h2>
              <p className="text-xs text-muted-foreground font-mono">{destinationId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/destinations/new?id=${destinationId}`}
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
                  tab === item.id ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {destinationQuery.isLoading ? (
            <WidgetLoading label="Loading destination…" />
          ) : destinationQuery.isError || !destinationQuery.data ? (
            <WidgetError message="Failed to load destination" onRetry={() => void destinationQuery.refetch()} />
          ) : (
            <>
              {tab === "overview" && (
                <OverviewTab destination={destinationQuery.data} geo={geo} destinationId={destinationId} />
              )}
              {tab === "hierarchy" && (
                <HierarchyTab
                  destination={destinationQuery.data}
                  breadcrumbs={breadcrumbsQuery.data ?? []}
                  children={childrenQuery.data ?? []}
                  loading={breadcrumbsQuery.isLoading || childrenQuery.isLoading}
                  onSelectDestination={onSelectDestination}
                />
              )}
              {tab === "nearby" && (
                <NearbyTab
                  nearby={nearbyQuery.data ?? []}
                  loading={nearbyQuery.isLoading}
                  onSelectDestination={onSelectDestination}
                />
              )}
              {tab === "seo" && <SeoTab destination={destinationQuery.data} destinationId={destinationId} />}
              {tab === "gallery" && <GalleryTab destination={destinationQuery.data} destinationId={destinationId} />}
              {tab === "faq" && <FaqTab destination={destinationQuery.data} destinationId={destinationId} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  destination,
  geo,
  destinationId,
}: {
  destination: Destination;
  geo?: GeoReference;
  destinationId: string;
}) {
  const [name, setName] = useState(destination.name);
  const [description, setDescription] = useState(destination.description ?? "");
  const [featured, setFeatured] = useState(destination.isFeatured);
  const updateMutation = useUpdateDestinationMutation(destinationId);
  const archiveMutation = useArchiveDestinationMutation(destinationId);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const editable = EDITABLE_DESTINATION_STATUSES.includes(destination.status);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{destination.name}</h3>
          <p className="text-sm text-muted-foreground font-mono mt-1">/{destination.slug}</p>
        </div>
        <DestinationStatusBadge status={destination.status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Country</dt>
          <dd className="font-medium">{resolveGeoName(destination.countryId, geo?.countriesById ?? new Map())}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">State</dt>
          <dd className="font-medium">{resolveGeoName(destination.stateId, geo?.statesById ?? new Map())}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Region</dt>
          <dd className="font-medium">{resolveGeoName(destination.regionId, geo?.regionsById ?? new Map())}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Category</dt>
          <dd className="font-medium">
            {resolveCategoryLabel(destination.categoryIds, geo?.categoriesById ?? new Map())}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Featured</dt>
          <dd>{destination.isFeatured ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Coordinates</dt>
          <dd>
            {destination.latitude != null && destination.longitude != null
              ? `${destination.latitude}, ${destination.longitude}`
              : "—"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Description</dt>
          <dd>{destination.description ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated</dt>
          <dd>{formatDestinationDate(destination.updatedAt)}</dd>
        </div>
      </dl>

      {editable && (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm font-medium">Edit name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-md" />
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-border rounded-md"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured destination
          </label>
          <button
            type="button"
            disabled={updateMutation.isPending}
            onClick={() =>
              void updateMutation.mutateAsync({
                name,
                description: description || null,
                isFeatured: featured,
              })
            }
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      )}

      {destination.status !== DestinationStatus.ARCHIVED && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            disabled={archiveMutation.isPending}
            onClick={() => setIsConfirmingArchive(true)}
            className="px-4 py-2 text-sm border border-amber-300 text-amber-800 rounded-md hover:bg-amber-50 disabled:opacity-50"
          >
            Archive destination
          </button>
        </div>
      )}

      {isConfirmingArchive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsConfirmingArchive(false)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Archive Destination</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to archive this destination? It will be hidden from the website.</p>
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

function HierarchyTab({
  destination,
  breadcrumbs,
  children,
  loading,
  onSelectDestination,
}: {
  destination: Destination;
  breadcrumbs: DestinationBreadcrumb[];
  children: Destination[];
  loading: boolean;
  onSelectDestination?: (id: string) => void;
}) {
  if (loading) return <WidgetLoading label="Loading hierarchy…" />;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-2">Breadcrumb (backend)</h4>
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              <button
                type="button"
                onClick={() => onSelectDestination?.(crumb.id)}
                className="text-primary hover:underline"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Parent</h4>
        {destination.parentDestinationId ? (
          (() => {
            const parentCrumb =
              breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
            return (
              <button
                type="button"
                onClick={() => onSelectDestination?.(destination.parentDestinationId!)}
                className="text-sm text-primary hover:underline"
              >
                {parentCrumb?.name ?? destination.parentDestinationId}
              </button>
            );
          })()
        ) : (
          <p className="text-sm text-muted-foreground">Root destination (no parent)</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Parent can only be set at create time — no PATCH for parentDestinationId.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Children ({children.length})</h4>
        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground">No child destinations.</p>
        ) : (
          <ul className="space-y-2">
            {children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => onSelectDestination?.(child.id)}
                  className="w-full text-left border border-border rounded-md px-3 py-2 text-sm hover:bg-muted/30"
                >
                  <span className="font-medium">{child.name}</span>
                  <span className="text-muted-foreground ml-2 font-mono text-xs">{child.slug}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NearbyTab({
  nearby,
  loading,
  onSelectDestination,
}: {
  nearby: Destination[];
  loading: boolean;
  onSelectDestination?: (id: string) => void;
}) {
  if (loading) return <WidgetLoading label="Loading nearby destinations…" />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-4">
        Calculated automatically based on geography.
      </p>
      {nearby.length === 0 ? (
        <p className="text-sm text-muted-foreground">No nearby destinations returned.</p>
      ) : (
        <ul className="space-y-2">
          {nearby.map((dest) => (
            <li key={dest.id}>
              <button
                type="button"
                onClick={() => onSelectDestination?.(dest.id)}
                className="w-full text-left border border-border rounded-md px-3 py-2 text-sm hover:bg-muted/30"
              >
                <span className="font-medium">{dest.name}</span>
                <span className="text-muted-foreground ml-2 font-mono text-xs">{dest.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SeoTab({ destination, destinationId }: { destination: Destination; destinationId: string }) {
  const updateMutation = useUpdateDestinationMutation(destinationId);
  const [metaTitle, setMetaTitle] = useState(destination.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(destination.seo.metaDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(destination.seo.focusKeyword ?? "");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Meta title</label>
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Meta description</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Focus keyword</label>
        <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-md" />
      </div>
      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={() =>
          void updateMutation.mutateAsync({
            seo: { ...destination.seo, metaTitle, metaDescription, focusKeyword },
          })
        }
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        Save SEO
      </button>
    </div>
  );
}

function GalleryTab({ destination, destinationId }: { destination: Destination; destinationId: string }) {
  const addMutation = useAddGalleryImageMutation(destinationId);
  const removeMutation = useRemoveGalleryImageMutation(destinationId);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Upload images for the destination gallery.</p>
      <div className="space-y-4">
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
                   await addMutation.mutateAsync({ url: file, altText: altText || undefined });
                } else {
                   const results = await uploadFiles([file], "GALLERY_IMAGE");
                   if (results.length > 0) {
                      await addMutation.mutateAsync({ url: results[0].url, altText: altText || undefined });
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
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Optional alt text for next upload"
          className="w-full px-3 py-2 text-sm border border-border rounded-md"
        />
      </div>
      {destination.gallery.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gallery images.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {destination.gallery.map((image) => (
            <li key={image.id} className="border border-border rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.altText ?? destination.name} className="w-full h-24 object-cover" />
              <div className="p-2 flex justify-between items-center gap-2">
                <span className="text-xs text-muted-foreground truncate">{image.altText ?? "—"}</span>
                <button
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => void removeMutation.mutateAsync(image.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqTab({ destination, destinationId }: { destination: Destination; destinationId: string }) {
  const addMutation = useAddFaqMutation(destinationId);
  const removeMutation = useRemoveFaqMutation(destinationId);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-2 border border-border rounded-md p-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="w-full px-3 py-2 text-sm border border-border rounded-md"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          rows={2}
          className="w-full px-3 py-2 text-sm border border-border rounded-md"
        />
        <button
          type="button"
          disabled={addMutation.isPending || !question.trim() || !answer.trim()}
          onClick={() => {
            void addMutation.mutateAsync({ question, answer }).then(() => {
              setQuestion("");
              setAnswer("");
            });
          }}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Add FAQ
        </button>
      </div>
      {destination.faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No FAQs yet.</p>
      ) : (
        <ul className="space-y-3">
          {destination.faqs.map((faq) => (
            <li key={faq.id} className="border border-border rounded-md p-4 text-sm">
              <p className="font-medium">{faq.question}</p>
              <p className="text-muted-foreground mt-1">{faq.answer}</p>
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => void removeMutation.mutateAsync(faq.id)}
                className="text-xs text-destructive hover:underline mt-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
