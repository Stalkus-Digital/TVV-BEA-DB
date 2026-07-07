import { Suspense } from "react";
import { AlertsPage } from "@/features/admin-operations/components/AlertsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AlertsPage />
    </Suspense>
  );
}
