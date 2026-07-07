import { Suspense } from "react";
import { InventoryBuilderPage } from "@/features/admin-inventory/components/InventoryBuilderPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function NewInventoryPage() {
  return (
    <div className="h-[calc(100vh-6rem)] -m-6">
      <Suspense fallback={<WidgetLoading label="Loading builder…" />}>
        <InventoryBuilderPage />
      </Suspense>
    </div>
  );
}
