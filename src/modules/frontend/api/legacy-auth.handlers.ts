import type { AuthContext } from "@/modules/auth";
import type { LegacyRequestMeta } from "../adapters/auth.adapter";
import { legacyLogin, legacyMe, legacyRegister } from "../services/legacy-auth.service";

export function legacyLoginHandler(body: unknown, meta: LegacyRequestMeta) {
  return legacyLogin(body, meta);
}

export function legacyRegisterHandler(body: unknown, meta: LegacyRequestMeta) {
  return legacyRegister(body, meta);
}

export function legacyMeHandler(context: AuthContext | null) {
  return legacyMe(context);
}
