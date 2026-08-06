import { Suspense } from "react";
import { LandingPagesPage } from "@/features/admin-marketing/components/LandingPagesPage";

export default function LandingPagesRoute() {
  return (
    <Suspense fallback={<div>Loading Landing Pages Builder...</div>}>
      <LandingPagesPage />
    </Suspense>
  );
}
