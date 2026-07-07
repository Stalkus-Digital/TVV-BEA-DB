import { Suspense } from "react";
import { FormsPage } from "@/features/admin-marketing/components/FormsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FormsPage />
    </Suspense>
  );
}
