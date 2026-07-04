import { SectionSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <SectionSkeleton title="Searching fares…" rows={3} />;
}
