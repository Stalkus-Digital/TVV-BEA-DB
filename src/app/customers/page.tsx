import { Suspense } from "react";
import { CustomersPage } from "@/features/admin-customers/components/CustomersPage";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function CustomersRoutePage() {
  return (
    <Suspense fallback={<WidgetLoading label="Loading customers…" />}>
      <CustomersPage />
    </Suspense>
  );
}
