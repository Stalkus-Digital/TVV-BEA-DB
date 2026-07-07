import { Suspense } from "react";
import { MarketingDashboardPage } from "@/features/admin-marketing/components/MarketingDashboardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketingDashboardPage />
    </Suspense>
  );
}
