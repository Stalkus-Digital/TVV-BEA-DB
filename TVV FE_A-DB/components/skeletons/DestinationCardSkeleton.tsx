export function DestinationCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] animate-pulse overflow-hidden rounded-lg bg-surface" aria-hidden />
  );
}

export function DestinationCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}
