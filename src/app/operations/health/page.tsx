import { Suspense } from "react";
import { SystemHealthPage } from "@/features/admin-operations/components/SystemHealthPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SystemHealthPage />
    </Suspense>
  );
}
