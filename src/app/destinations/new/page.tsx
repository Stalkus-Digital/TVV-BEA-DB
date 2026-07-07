import { Suspense } from "react";
import { DestinationBuilderPage } from "@/features/admin-destinations/components/DestinationBuilderPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function NewDestinationPage() {
  return (
    <div className="h-[calc(100vh-6rem)] -m-6">
      <Suspense fallback={<WidgetLoading label="Loading builder…" />}>
        <DestinationBuilderPage />
      </Suspense>
    </div>
  );
}
