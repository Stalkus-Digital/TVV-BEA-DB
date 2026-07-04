import { setLogSink } from "@/shared/logger";
import { logStore } from "./log-store";

let installed = false;

/** Idempotent — safe to call from `module.ts` every time it's imported (HMR, multiple resolves). */
export function installLogCapture(): void {
  if (installed) return;
  setLogSink((entry) => logStore.record(entry));
  installed = true;
}
