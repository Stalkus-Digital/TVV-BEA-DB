import { jsonError, jsonSuccess } from "@/api";
import { getSystemMetricsHandler } from "@/modules/observability";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getSystemMetricsHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
