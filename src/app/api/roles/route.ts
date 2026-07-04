import { jsonError, jsonSuccess } from "@/api";
import { listRolesHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listRolesHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
