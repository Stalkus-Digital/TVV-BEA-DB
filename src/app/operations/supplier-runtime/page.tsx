import { Suspense } from "react";
import { SupplierRuntimePage } from "@/features/admin-operations/components/SupplierRuntimePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SupplierRuntimePage />
    </Suspense>
  );
}
