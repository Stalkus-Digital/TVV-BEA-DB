import { Container } from "@/components/ui/Container";
import { PackageCardSkeletonGrid } from "./PackageCardSkeleton";

/**
 * Generic loading shell for any package-list section. Mirrors the layout of
 * FeaturedJourneys / PackageListing so swap-in feels seamless.
 */
export function SectionSkeleton({
  title = "Loading curated journeys…",
  rows = 6,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <section className="bg-cream py-section" aria-busy>
      <Container>
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 h-3 w-32 animate-pulse rounded bg-surface" aria-hidden />
          <h2 className="font-display text-[28px] text-ink/70">{title}</h2>
          <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-surface" aria-hidden />
        </div>
        <PackageCardSkeletonGrid count={rows} />
      </Container>
    </section>
  );
}
