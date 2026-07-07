import { Suspense } from "react";
import { OperationsDashboardPage } from "@/features/admin-operations/components/OperationsDashboardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OperationsDashboardPage />
    </Suspense>
  );
}
