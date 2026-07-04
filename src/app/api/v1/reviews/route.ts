import { jsonError } from "@/api";
import { notImplementedHandler } from "@/modules/frontend";

export async function GET() {
  return jsonError(notImplementedHandler("Reviews"));
}
