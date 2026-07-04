import type { RoleName } from "../types/role";

export interface JwtPayload {
  sub: string; // userId
  email: string;
  sessionId: string;
  roles: RoleName[];
  iat: number;
  exp: number;
}
