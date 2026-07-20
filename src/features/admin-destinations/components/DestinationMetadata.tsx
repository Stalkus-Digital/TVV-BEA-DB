"use client";

import { Clock, Tag, Star, Eye } from "lucide-react";
import type { Destination } from "../types";
import { formatDestinationDate } from "../utils";
import { DestinationStatusBadge } from "./DestinationStatusBadge";

interface DestinationMetadataProps {
  destination: Destination;
}

export function DestinationMetadata({ destination }: DestinationMetadataProps) {
  const isRecent = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Metadata</h4>

      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Status */}
        <div>
          <p className="text-muted-foreground mb-1">Status</p>
          <DestinationStatusBadge status={destination.status} />
        </div>

        {/* Featured */}
        <div>
          <p className="text-muted-foreground mb-1">Featured</p>
          <div className="flex items-center gap-2">
            {destination.isFeatured ? (
              <>
                <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span className="font-medium text-amber-700">Yes</span>
              </>
            ) : (
              <>
                <Star className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">No</span>
              </>
            )}
          </div>
        </div>

        {/* Created */}
        <div>
          <p className="text-muted-foreground mb-1">Created</p>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={isRecent(destination.createdAt) ? "text-green-700 font-medium" : ""}>
              {formatDestinationDate(destination.createdAt)}
            </span>
          </div>
        </div>

        {/* Updated */}
        <div>
          <p className="text-muted-foreground mb-1">Updated</p>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={isRecent(destination.updatedAt) ? "text-blue-700 font-medium" : ""}>
              {formatDestinationDate(destination.updatedAt)}
            </span>
          </div>
        </div>

        {/* ID */}
        <div className="col-span-2">
          <p className="text-muted-foreground mb-1">Destination ID</p>
          <code className="block p-2 rounded bg-card border border-border text-[11px] font-mono text-muted-foreground break-all">
            {destination.id}
          </code>
        </div>

        {/* Slug */}
        <div className="col-span-2">
          <p className="text-muted-foreground mb-1">URL Slug</p>
          <code className="block p-2 rounded bg-card border border-border text-[11px] font-mono text-foreground">
            /{destination.slug}
          </code>
        </div>

        {/* SEO Status */}
        {destination.seo && Object.values(destination.seo).filter(Boolean).length > 0 && (
          <div className="col-span-2">
            <p className="text-muted-foreground mb-1">SEO Configuration</p>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-600" />
              <span className="text-green-700 font-medium">Configured</span>
              <span className="text-xs text-muted-foreground">
                ({Object.values(destination.seo).filter(Boolean).length} fields)
              </span>
            </div>
          </div>
        )}

        {/* Gallery Status */}
        {destination.gallery && destination.gallery.length > 0 && (
          <div className="col-span-2">
            <p className="text-muted-foreground mb-1">Media</p>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-600" />
              <span className="text-green-700 font-medium">{destination.gallery.length} image(s)</span>
            </div>
          </div>
        )}

        {/* FAQ Status */}
        {destination.faqs && destination.faqs.length > 0 && (
          <div className="col-span-2">
            <p className="text-muted-foreground mb-1">FAQs</p>
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-green-600" />
              <span className="text-green-700 font-medium">{destination.faqs.length} item(s)</span>
            </div>
          </div>
        )}
      </div>

      {/* Info notice */}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        All changes are tracked in the audit log. Contact support if you need a detailed change history.
      </p>
    </div>
  );
}
