import { Suspense } from "react";
import { InventoryPage } from "@/features/admin-inventory/components/InventoryPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function InventoryRoutePage() {
  return (
    <Suspense fallback={<WidgetLoading label="Loading inventory…" />}>
      <InventoryPage />
    </Suspense>
  );
}
