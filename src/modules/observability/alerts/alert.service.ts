import type { ModuleStatusReport } from "../types/module-status";
import type { SlowQueryEntry } from "../types/slow-query";
import type { Alert } from "../types/alert";
import { evaluateAlerts } from "./alert-rule";

/** Thin wrapper so `api/system.handlers.ts` depends on a service, not a bare function — consistent with every other module's boundary discipline. */
export class AlertService {
  getActiveAlerts(statuses: ModuleStatusReport[], slowQueries: SlowQueryEntry[]): Alert[] {
    return evaluateAlerts(statuses, slowQueries);
  }
}
