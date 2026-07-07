import { Suspense } from "react";
import { HomeSectionsPage } from "@/features/admin-cms/components/HomeSectionsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeSectionsPage />
    </Suspense>
  );
}
