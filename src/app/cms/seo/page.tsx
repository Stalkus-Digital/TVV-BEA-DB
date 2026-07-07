import { Suspense } from "react";
import { SeoPagesPage } from "@/features/admin-cms/components/SeoPagesPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SeoPagesPage />
    </Suspense>
  );
}
