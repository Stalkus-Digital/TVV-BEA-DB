import { jsonError, jsonSuccess } from "@/api";
import { getWebsiteDestinationTreeHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await getWebsiteDestinationTreeHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
