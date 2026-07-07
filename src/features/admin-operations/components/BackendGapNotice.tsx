"use client";

import { AlertTriangle } from "lucide-react";

interface BackendGapNoticeProps {
  title: string;
  message: string;
}

export function BackendGapNotice({ title, message }: BackendGapNoticeProps) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
