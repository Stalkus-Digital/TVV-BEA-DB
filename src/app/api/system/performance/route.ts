import { jsonError, jsonSuccess } from "@/api";
import { getSystemPerformanceHandler } from "@/modules/observability";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getSystemPerformanceHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
