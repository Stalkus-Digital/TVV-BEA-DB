import { jsonError, jsonSuccess } from "@/api";
import { listPermissionsHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listPermissionsHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
