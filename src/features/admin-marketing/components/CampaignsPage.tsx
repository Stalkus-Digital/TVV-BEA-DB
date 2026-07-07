"use client";

import { BACKEND_GAPS } from "../constants";
import { BackendGapNotice } from "./BackendGapNotice";
import { MarketingPageShell } from "./MarketingPageShell";

export function CampaignsPage() {
  return (
    <MarketingPageShell
      title="Campaigns"
      description="Marketing campaign management requires a Campaign Engine that does not exist yet."
    >
      <BackendGapNotice title="No Campaign API" message={BACKEND_GAPS.campaigns} />
      <p className="text-sm text-muted-foreground mt-4">
        This screen is intentionally read-only. No campaign list, create, or edit functionality is available until a backend Campaign module is implemented.
      </p>
    </MarketingPageShell>
  );
}
