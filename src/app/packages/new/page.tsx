import { Suspense } from "react";
import { PackageSingleForm } from "@/features/admin-packages/components/PackageSingleForm";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function Page() {
  return (
    <div className="w-full">
      <Suspense fallback={<WidgetLoading label="Loading builder…" />}>
        <PackageSingleForm />
      </Suspense>
    </div>
  );
}
