import { jsonError, jsonSuccess } from "@/api";
import { getSystemVersionHandler } from "@/modules/observability";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getSystemVersionHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
