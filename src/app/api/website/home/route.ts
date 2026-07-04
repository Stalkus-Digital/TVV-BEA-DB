import { jsonError, jsonSuccess } from "@/api";
import { getHomepageHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getHomepageHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
