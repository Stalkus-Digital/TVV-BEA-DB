import { Suspense } from "react";
import { FaqManagementPage } from "@/features/admin-cms/components/FaqManagementPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FaqManagementPage />
    </Suspense>
  );
}
