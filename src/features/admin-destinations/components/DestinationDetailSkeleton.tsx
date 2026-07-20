"use client";

export function DestinationDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse" />
      </div>

      {/* Status and Featured */}
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded-full w-24 animate-pulse" />
        <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
      </div>

      {/* Info rows */}
      <div className="space-y-3 border-t border-border pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded-md w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-md w-20 animate-pulse" />
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
