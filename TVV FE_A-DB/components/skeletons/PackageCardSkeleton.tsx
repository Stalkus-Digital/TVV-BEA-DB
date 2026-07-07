import { cn } from "@/lib/utils";

export function PackageCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card",
        className,
      )}
      aria-hidden
    >
      <div className="aspect-[16/10] animate-pulse bg-surface" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-surface" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-surface" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-surface" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded bg-surface" />
          <div className="h-5 w-16 animate-pulse rounded bg-surface" />
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="space-y-1.5">
            <div className="h-3 w-16 animate-pulse rounded bg-surface" />
            <div className="h-6 w-28 animate-pulse rounded bg-surface" />
          </div>
        </div>
        <div className="h-10 w-full animate-pulse rounded-md bg-surface" />
      </div>
    </div>
  );
}

export function PackageCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  );
}
