import { NotImplementedError } from "@/shared/errors";
import type { UnimplementedEngine } from "../dto/unsupported.dto";

/**
 * Every stub route for Ferry/Flights/Guides/Experiences/Reviews/Calculator
 * calls this — one place that produces the explicit NOT_IMPLEMENTED
 * response the sprint asked for, instead of each stub inventing its own
 * error text. See docs/26/29 for why each of these has no Travel OS
 * backend module to call into yet. Returns the `AppError` directly, not a
 * `Result` — there is no success case here, so a `Result` wrapper only
 * adds a branch that can never be taken.
 */
export function notImplemented(engine: UnimplementedEngine): NotImplementedError {
  return new NotImplementedError(
    `${engine} is not implemented yet — no Travel OS backend module exists for this content type. See docs/26_FRONTEND_BACKEND_MAPPING.md and docs/30_FRONTEND_COMPATIBILITY_LAYER.md.`
  );
}
