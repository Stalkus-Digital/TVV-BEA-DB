import { Suspense } from "react";
import { ContentPerformancePage } from "@/features/admin-marketing/components/ContentPerformancePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContentPerformancePage />
    </Suspense>
  );
}
