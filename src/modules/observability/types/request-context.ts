/** Attached to every request by `middleware.ts` — `requestId` is always fresh; `correlationId` is reused from an incoming `x-correlation-id` header when present, so a caller can thread one correlation id across several requests it makes. */
export interface RequestContext {
  requestId: string;
  correlationId: string;
}
