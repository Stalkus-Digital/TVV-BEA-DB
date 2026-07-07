import { Suspense } from "react";
import { LandingPagesManager } from "@/features/admin-cms/components/LandingPagesManager";

export default function LandingPagesRoute() {
  return (
    <Suspense fallback={<div>Loading Landing Pages Builder...</div>}>
      <LandingPagesManager />
    </Suspense>
  );
}
