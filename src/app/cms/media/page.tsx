import { Suspense } from "react";
import { MediaBrowserPage } from "@/features/admin-cms/components/MediaBrowserPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MediaBrowserPage />
    </Suspense>
  );
}
