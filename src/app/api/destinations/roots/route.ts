import { jsonError, jsonSuccess } from "@/api";
import { listMarketRootDestinationsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listMarketRootDestinationsHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
