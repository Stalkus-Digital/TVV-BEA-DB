"use client";

import { useState } from "react";
import { BACKEND_GAPS, LOG_LEVELS } from "../constants";
import { useSystemLogsQuery } from "../hooks/useOperationsQueries";
import { formatDate } from "../utils";

import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function SystemLogsPage() {
  const [level, setLevel] = useState<string>("");
  const [scope, setScope] = useState("");
  const [limit, setLimit] = useState(100);

  const logsQuery = useSystemLogsQuery({
    level: level || undefined,
    scope: scope || undefined,
    limit,
  });

  return (
    <OperationsPageShell
      title="System Logs"
      description="Live streaming logs and historical diagnostic events."
      isLoading={logsQuery.isLoading}
      isError={logsQuery.isError}
      errorMessage={logsQuery.error instanceof Error ? logsQuery.error.message : undefined}
      isRefreshing={logsQuery.isFetching}
      onRefresh={() => void logsQuery.refetch()}
      onRetry={() => void logsQuery.refetch()}
      isEmpty={!logsQuery.isLoading && !logsQuery.isError && (logsQuery.data?.length ?? 0) === 0}
      emptyMessage="No log entries match your filters"
    >


      <div className="flex flex-wrap gap-3 mb-4">
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-background border border-input rounded-md px-3 py-2 text-sm">
          <option value="">All levels</option>
          {LOG_LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Scope filter (exact)…"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="flex-1 min-w-[180px] bg-background border border-input rounded-md px-3 py-2 text-sm"
        />
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="bg-background border border-input rounded-md px-3 py-2 text-sm">
          {[50, 100, 200, 500].map((value) => (
            <option key={value} value={value}>{value} entries</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium">Level</th>
              <th className="text-left px-4 py-3 font-medium">Scope</th>
              <th className="text-left px-4 py-3 font-medium">Message</th>
              <th className="text-left px-4 py-3 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody>
            {(logsQuery.data ?? []).map((entry, index) => (
              <tr key={`${entry.timestamp}-${entry.scope}-${index}`} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                <td className="px-4 py-3"><StatusBadge status={entry.level} /></td>
                <td className="px-4 py-3 font-mono text-xs">{entry.scope}</td>
                <td className="px-4 py-3">{entry.message}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                  {entry.meta ? JSON.stringify(entry.meta) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OperationsPageShell>
  );
}
