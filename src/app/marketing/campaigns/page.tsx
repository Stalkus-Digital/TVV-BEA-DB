import { Suspense } from "react";
import { CampaignsPage } from "@/features/admin-marketing/components/CampaignsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CampaignsPage />
    </Suspense>
  );
}
