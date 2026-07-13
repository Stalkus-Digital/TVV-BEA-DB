import { Suspense } from "react";
import { HotelForm } from "@/features/admin-hotels/components/HotelForm";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

export default function CreateHotelPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<WidgetLoading label="Loading hotel form…" />}>
        <HotelForm />
      </Suspense>
    </div>
  );
}
