import { Suspense } from "react";
import { NavigationPage } from "@/features/admin-cms/components/NavigationPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NavigationPage />
    </Suspense>
  );
}
