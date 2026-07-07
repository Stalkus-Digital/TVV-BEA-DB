import { fromStatus } from "./errors";

export function unwrapApiData(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const rec = body as Record<string, unknown>;

  if (rec.success === false) {
    const nested = rec.error;
    const message =
      nested && typeof nested === "object" && typeof (nested as { message?: string }).message === "string"
        ? (nested as { message: string }).message
        : "Request failed";
    throw fromStatus(400, { error: { message } });
  }

  if (rec.success === true && "data" in rec) {
    return rec.data;
  }

  return body;
}
