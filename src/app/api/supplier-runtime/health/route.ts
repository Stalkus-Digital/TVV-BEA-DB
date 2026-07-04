import { jsonError, jsonSuccess } from "@/api";
import { getRuntimeHealthHandler } from "@/modules/supplier/runtime";
import { isErr } from "@/shared/types";

/** Internal diagnostic endpoint — authenticated-only (no public allow-list entry), no frontend consumption. */
export async function GET() {
  const result = await getRuntimeHealthHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
