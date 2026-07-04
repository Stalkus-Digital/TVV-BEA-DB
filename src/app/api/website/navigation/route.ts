import { jsonError, jsonSuccess } from "@/api";
import { getNavigationHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getNavigationHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
