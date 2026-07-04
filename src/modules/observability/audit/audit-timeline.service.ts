import { randomUUID } from "node:crypto";
import { AuditTimelineCategory, type AuditTimelineEntry } from "../types/audit-timeline-entry";
import type { ModuleStatusReport } from "../types/module-status";

const DEFAULT_CAPACITY = 200;

/**
 * A system-level audit trail distinct from Auth's own `AuditLog` (which
 * records user actions — login, permission-denied). This one is
 * self-contained within Observability and self-fed: every time
 * `recordStatusTransitions` is called with a fresh snapshot, it diffs
 * against the previously-seen status per module and appends an entry only
 * for what actually changed. No other module needs to call into this for
 * it to have real content.
 */
export class AuditTimelineService {
  private readonly entries: AuditTimelineEntry[] = [];
  private readonly lastKnownStatus = new Map<string, string>();

  record(category: AuditTimelineCategory, message: string, details?: Record<string, unknown>): AuditTimelineEntry {
    const entry: AuditTimelineEntry = { id: randomUUID(), timestamp: new Date().toISOString(), category, message, details };
    this.entries.push(entry);
    if (this.entries.length > DEFAULT_CAPACITY) this.entries.shift();
    return entry;
  }

  /** Called once per dashboard read with the freshly-computed module statuses — records a transition entry only for modules whose status actually changed since the last call. */
  recordStatusTransitions(statuses: ModuleStatusReport[]): void {
    for (const report of statuses) {
      const previous = this.lastKnownStatus.get(report.name);
      if (previous !== undefined && previous !== report.status) {
        this.record(
          AuditTimelineCategory.MODULE_STATUS_CHANGE,
          `${report.name} transitioned ${previous} -> ${report.status}`,
          { module: report.name, from: previous, to: report.status, latencyMs: report.latencyMs }
        );
      }
      this.lastKnownStatus.set(report.name, report.status);
    }
  }

  list(limit = 50): AuditTimelineEntry[] {
    return this.entries.slice(-limit).reverse();
  }
}
