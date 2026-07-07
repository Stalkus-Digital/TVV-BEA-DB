import { SectionSkeleton } from "@/components/skeletons";

/**
 * Default loading state used by App Router segments without a more specific
 * `loading.tsx`. Mirrors the layout density of a typical listing page.
 */
export default function Loading() {
  return <SectionSkeleton title="Loading curated journeys…" rows={6} />;
}
