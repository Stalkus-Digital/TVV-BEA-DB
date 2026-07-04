import { randomUUID } from "node:crypto";
import type { RequestContext } from "../types/request-context";

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";

/** Always fresh per request — never reused across requests, unlike correlationId. */
export function generateRequestId(): string {
  return randomUUID();
}

/** Reuses a caller-supplied correlation id (so a client can thread one id across several calls it makes); mints a fresh one otherwise. */
export function resolveCorrelationId(incoming: string | null): string {
  return incoming && incoming.trim().length > 0 ? incoming : randomUUID();
}

/**
 * `middleware.ts` calls this once per request, the same "resolve once in
 * middleware, forward via headers" pattern `auth-guard.ts`'s
 * `forwardAuthHeaders` already established — Next.js gives middleware and
 * route handlers no shared in-memory context, so headers are the only
 * reliable channel between them (see auth-guard.ts's docstring for the
 * full, previously-verified finding this reuses rather than re-discovers).
 */
export function buildRequestContext(incomingCorrelationId: string | null): RequestContext {
  return { requestId: generateRequestId(), correlationId: resolveCorrelationId(incomingCorrelationId) };
}

/** Sets both the forwarded request headers (so a route handler can read them back via `readRequestContextFromHeaders`) and, when given a response's headers, mirrors them onto the response so a caller can see its own request/correlation id. */
export function attachRequestContextHeaders(headers: Headers, context: RequestContext): void {
  headers.set(REQUEST_ID_HEADER, context.requestId);
  headers.set(CORRELATION_ID_HEADER, context.correlationId);
}

export function readRequestContextFromHeaders(headers: Headers): RequestContext | null {
  const requestId = headers.get(REQUEST_ID_HEADER);
  const correlationId = headers.get(CORRELATION_ID_HEADER);
  if (!requestId || !correlationId) return null;
  return { requestId, correlationId };
}

export { REQUEST_ID_HEADER, CORRELATION_ID_HEADER };
