import { Suspense } from "react";
import { PackagesPage } from "@/features/admin-packages/components/PackagesPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function PackagesRoutePage() {
  return (
    <Suspense fallback={<WidgetLoading label="Loading packages…" />}>
      <PackagesPage />
    </Suspense>
  );
}
