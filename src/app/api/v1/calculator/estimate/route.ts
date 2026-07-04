import { jsonError } from "@/api";
import { notImplementedHandler } from "@/modules/frontend";

export async function POST() {
  return jsonError(notImplementedHandler("Calculator"));
}
