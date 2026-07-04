import type { UnimplementedEngine } from "../dto/unsupported.dto";
import { notImplemented } from "../services/unsupported.service";

export function notImplementedHandler(engine: UnimplementedEngine) {
  return notImplemented(engine);
}
