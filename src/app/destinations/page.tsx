import { Suspense } from "react";
import { DestinationsPage } from "@/features/admin-destinations/components/DestinationsPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function DestinationsRoutePage() {
  return (
    <Suspense fallback={<WidgetLoading label="Loading destinations…" />}>
      <DestinationsPage />
    </Suspense>
  );
}
