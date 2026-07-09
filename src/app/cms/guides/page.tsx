import { Suspense } from "react";
import { GuidesPage } from "@/features/admin-cms/components/GuidesPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuidesPage />
    </Suspense>
  );
}
