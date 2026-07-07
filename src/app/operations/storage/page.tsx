import { Suspense } from "react";
import { StorageOperationsPage } from "@/features/admin-operations/components/StorageOperationsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StorageOperationsPage />
    </Suspense>
  );
}
