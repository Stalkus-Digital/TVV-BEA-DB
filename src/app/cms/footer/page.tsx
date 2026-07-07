import { Suspense } from "react";
import { FooterContentPage } from "@/features/admin-cms/components/FooterContentPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FooterContentPage />
    </Suspense>
  );
}
