import { describe, expect, it } from "vitest";
import { AuditTimelineService } from "@/modules/observability/audit/audit-timeline.service";
import { AuditTimelineCategory } from "@/modules/observability/types/audit-timeline-entry";
import { ModuleStatus, type ModuleStatusReport } from "@/modules/observability/types/module-status";

function report(name: string, status: ModuleStatus): ModuleStatusReport {
  return { name, status, latencyMs: 1, lastActivityAt: null };
}

describe("AuditTimelineService", () => {
  it("records nothing on the first observation of a module (no prior status to compare against)", () => {
    const timeline = new AuditTimelineService();
    timeline.recordStatusTransitions([report("booking", ModuleStatus.HEALTHY)]);
    expect(timeline.list()).toHaveLength(0);
  });

  it("records a transition entry when a module's status changes between calls", () => {
    const timeline = new AuditTimelineService();
    timeline.recordStatusTransitions([report("booking", ModuleStatus.HEALTHY)]);
    timeline.recordStatusTransitions([report("booking", ModuleStatus.DEGRADED)]);
    const entries = timeline.list();
    expect(entries).toHaveLength(1);
    expect(entries[0].category).toBe(AuditTimelineCategory.MODULE_STATUS_CHANGE);
    expect(entries[0].message).toContain("HEALTHY -> DEGRADED");
  });

  it("records nothing when status stays the same across calls", () => {
    const timeline = new AuditTimelineService();
    timeline.recordStatusTransitions([report("booking", ModuleStatus.HEALTHY)]);
    timeline.recordStatusTransitions([report("booking", ModuleStatus.HEALTHY)]);
    expect(timeline.list()).toHaveLength(0);
  });

  it("record() directly appends an entry, most-recent first via list()", () => {
    const timeline = new AuditTimelineService();
    timeline.record(AuditTimelineCategory.SLOW_QUERY, "first");
    timeline.record(AuditTimelineCategory.SLOW_QUERY, "second");
    const entries = timeline.list();
    expect(entries[0].message).toBe("second");
    expect(entries[1].message).toBe("first");
  });
});
