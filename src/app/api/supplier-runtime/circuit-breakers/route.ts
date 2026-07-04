import { jsonError, jsonSuccess } from "@/api";
import { getRuntimeCircuitBreakersHandler } from "@/modules/supplier/runtime";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getRuntimeCircuitBreakersHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
