import { jsonError, jsonSuccess } from "@/api";
import { listFeaturedDestinationsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listFeaturedDestinationsHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
