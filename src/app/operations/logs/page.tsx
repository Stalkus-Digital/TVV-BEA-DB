import { Suspense } from "react";
import { SystemLogsPage } from "@/features/admin-operations/components/SystemLogsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SystemLogsPage />
    </Suspense>
  );
}
