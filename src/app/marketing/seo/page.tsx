import { Suspense } from "react";
import { SeoDashboardPage } from "@/features/admin-marketing/components/SeoDashboardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SeoDashboardPage />
    </Suspense>
  );
}
