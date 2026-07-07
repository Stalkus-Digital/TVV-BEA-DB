import { Suspense } from "react";
import { LandingPagesPage } from "@/features/admin-marketing/components/LandingPagesPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LandingPagesPage />
    </Suspense>
  );
}
