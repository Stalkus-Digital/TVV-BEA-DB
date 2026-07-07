import { Suspense } from "react";
import { GuidesGapPage } from "@/features/admin-cms/components/CmsGapPages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuidesGapPage />
    </Suspense>
  );
}
