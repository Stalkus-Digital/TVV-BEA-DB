import { jsonError, jsonSuccess } from "@/api";
import { listPackageTemplatesHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listPackageTemplatesHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
