"use client";

import { BACKEND_GAPS } from "../constants";
import { BackendGapNotice } from "./BackendGapNotice";
import { CmsPageShell } from "./CmsPageShell";

interface GapPageProps {
  title: string;
  gapKey: keyof typeof BACKEND_GAPS;
  description: string;
}

export function CmsGapPage({ title, gapKey, description }: GapPageProps) {
  return (
    <CmsPageShell title={title} description={description}>
      <BackendGapNotice title="Backend not available" message={BACKEND_GAPS[gapKey]} />
      <p className="text-sm text-muted-foreground mt-4">
        This screen is intentionally limited to documenting the gap. No mock data or temporary JSON is shown.
      </p>
    </CmsPageShell>
  );
}

export function RedirectManagementPage() {
  return (
    <CmsGapPage
      title="Redirect Management"
      gapKey="redirects"
      description="URL redirect rules require a CMS Engine that does not exist yet."
    />
  );
}

export function StaticPagesPage() {
  return (
    <CmsGapPage
      title="Static Pages"
      gapKey="staticPages"
      description="Static page authoring requires a CMS Engine that does not exist yet."
    />
  );
}

export function GuidesGapPage() {
  return (
    <CmsGapPage
      title="Guides (Blogs)"
      gapKey="guides"
      description="Guide/blog content requires the Guides API — currently returns NotImplemented."
    />
  );
}
