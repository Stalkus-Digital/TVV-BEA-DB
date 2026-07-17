"use client";

import dynamic from "next/dynamic";
import type { CmsRichTextEditorProps } from "./CmsRichTextEditorInner";

const CmsRichTextEditorInner = dynamic(() => import("./CmsRichTextEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[360px] rounded-md border border-input bg-white flex items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export function CmsRichTextEditor(props: CmsRichTextEditorProps) {
  return <CmsRichTextEditorInner {...props} />;
}
