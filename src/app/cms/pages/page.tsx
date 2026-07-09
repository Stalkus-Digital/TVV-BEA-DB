import { Suspense } from "react";
import { StaticPagesPage } from "@/features/admin-cms/components/StaticPagesPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StaticPagesPage />
    </Suspense>
  );
}
