import { Suspense } from "react";
import { PackageBuilderPage } from "@/features/admin-packages/components/PackageBuilderPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function NewPackagePage() {
  return (
    <div className="h-[calc(100vh-6rem)] -m-6">
      <Suspense fallback={<WidgetLoading label="Loading builder…" />}>
        <PackageBuilderPage />
      </Suspense>
    </div>
  );
}
