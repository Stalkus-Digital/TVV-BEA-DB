import { Suspense } from "react";
import { ActivityForm } from "@/features/admin-activities/components/ActivityForm";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function CreateActivityPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<WidgetLoading label="Loading activity form…" />}>
        <ActivityForm />
      </Suspense>
    </div>
  );
}
