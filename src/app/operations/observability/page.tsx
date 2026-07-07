import { Suspense } from "react";
import { ObservabilityPage } from "@/features/admin-operations/components/ObservabilityPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ObservabilityPage />
    </Suspense>
  );
}
