import { Suspense } from "react";
import { CmsDashboardPage } from "@/features/admin-cms/components/CmsDashboardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CmsDashboardPage />
    </Suspense>
  );
}
