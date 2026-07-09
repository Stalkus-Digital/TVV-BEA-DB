import { jsonError, jsonSuccess } from "@/api";
import { getSystemHealthHandler } from "@/modules/observability";
import { isErr } from "@/shared/types";

/** Public, same tier as the existing `GET /api/health` — a richer view (per-module status + version), not a replacement for it. */
export async function GET() {
  const result = await getSystemHealthHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: result.value.status === "unhealthy" ? 503 : 200 });
}
