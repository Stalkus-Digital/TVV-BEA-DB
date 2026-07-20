"use client";

import { CheckCircle2, XCircle, AlertCircle, Clock, Zap } from "lucide-react";

interface ConnectionDetails {
  status: string;
  isAuthValid: boolean;
  lastCheckAt: string | null;
  responseTimeMs: number | null;
  consecutiveFailures: number;
}

interface ConnectionHistoryEntry {
  id: string;
  timestamp: string;
  operation: string;
  success: boolean;
  durationMs: number;
  httpStatus: number | null;
  summary: string;
  errorMessage: string | null;
}

export function ConnectionDetailsPanel({
  details,
  history,
  loading,
}: {
  details: ConnectionDetails | null;
  history: ConnectionHistoryEntry[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground">
        Loading details...
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Status Summary */}
      {details && (
        <div className="space-y-2 rounded border border-border p-2 bg-card">
          <h4 className="text-xs font-semibold flex items-center gap-2">
            <Zap className="w-3 h-3" /> Current Status
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Authentication:</span>
              <div className="flex items-center gap-1">
                {details.isAuthValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span className="text-red-700">Invalid</span>
                  </>
                )}
              </div>
            </div>
            {details.responseTimeMs && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-mono text-sm">{details.responseTimeMs}ms</span>
              </div>
            )}
            {details.consecutiveFailures > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consecutive Failures:</span>
                <span className="text-red-600 font-semibold">{details.consecutiveFailures}</span>
              </div>
            )}
            {details.lastCheckAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Check:</span>
                <span className="text-muted-foreground">
                  {new Date(details.lastCheckAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Operations */}
      {history.length > 0 && (
        <div className="space-y-2 rounded border border-border p-2 bg-card max-h-64 overflow-y-auto">
          <h4 className="text-xs font-semibold flex items-center gap-2">
            <Clock className="w-3 h-3" /> Recent Operations
          </h4>
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-xs p-1.5 rounded border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="shrink-0 mt-1">
                  {entry.success ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium capitalize">{entry.operation}</span>
                    <span className="text-muted-foreground text-[10px] shrink-0">
                      {entry.durationMs}ms
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1">{entry.summary}</p>
                  {entry.errorMessage && (
                    <p className="text-red-600 line-clamp-1 flex items-start gap-1">
                      <AlertCircle className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                      {entry.errorMessage}
                    </p>
                  )}
                  <p className="text-muted-foreground text-[10px]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!details && history.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">
          No connection data available yet. Configure and test the integration to see details.
        </p>
      )}
    </div>
  );
}
