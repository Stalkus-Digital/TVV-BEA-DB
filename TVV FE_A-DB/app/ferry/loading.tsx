import { SectionSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <SectionSkeleton title="Fetching ferry schedules…" rows={3} />;
}
