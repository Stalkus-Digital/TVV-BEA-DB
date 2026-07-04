import { healthCheckRegistry } from "@/shared/health";
import { jsonError, jsonSuccess } from "@/api";

/**
 * The first real route this codebase has (see docs/01_CURRENT_SYSTEM_AUDIT.md —
 * zero src/app/api/* handlers existed before this). Purely a demonstration
 * that the shared health-check foundation works end-to-end; no business
 * module depends on this yet.
 */
export async function GET() {
  try {
    const overall = await healthCheckRegistry.getOverallHealth();
    return jsonSuccess(overall, { status: overall.status === "healthy" ? 200 : 503 });
  } catch (error) {
    return jsonError(error);
  }
}
