import { Suspense } from "react";
import { RedirectManagementPage } from "@/features/admin-cms/components/CmsGapPages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RedirectManagementPage />
    </Suspense>
  );
}
