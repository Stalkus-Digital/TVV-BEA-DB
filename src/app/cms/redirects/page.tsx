import { Suspense } from "react";
import { RedirectsPage } from "@/features/admin-cms/components/RedirectsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RedirectsPage />
    </Suspense>
  );
}
