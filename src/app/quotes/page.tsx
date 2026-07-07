import { Suspense } from "react";
import { QuotesPage } from "@/features/admin-quotes/components/QuotesPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function QuotesRoutePage() {
  return (
    <Suspense fallback={<WidgetLoading label="Loading quotes…" />}>
      <QuotesPage />
    </Suspense>
  );
}
