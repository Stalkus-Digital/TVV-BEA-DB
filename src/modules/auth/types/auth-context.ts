import type { RoleName } from "./role";

/** What middleware/auth-guard.ts resolves a verified access token into — the shape every downstream permission check and audit-log entry works from. */
export interface AuthContext {
  userId: string;
  email: string;
  sessionId: string;
  roles: RoleName[];
  permissionKeys: string[];
}
