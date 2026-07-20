import { RoleName } from "../types/role";

/**
 * Pure decision logic, no I/O — same pattern as
 * services/login-attempt-policy.ts. Defines a strict authority ordering so
 * role assignment/revocation can be validated in the service layer, not
 * just at the API layer via the USERS:CREATE/DELETE permission check —
 * that check says an actor may call the endpoint at all, but says nothing
 * about WHICH role they're granting or removing. Without this, any ADMIN
 * (which holds USERS:CREATE) could grant itself SUPER_ADMIN, since
 * UserService.assignRole() previously assigned whatever roleId was
 * supplied with no check on the actor's own authority.
 *
 * SUPER_ADMIN sits alone at the top — only an existing SUPER_ADMIN can
 * create another one. ADMIN is capped just below it, matching this
 * codebase's existing "ADMIN gets full business-resource access but not
 * ROLES/SETTINGS administration" boundary (permission-seed.ts) — that
 * boundary was already enforced for direct /api/roles calls; this closes
 * the same gap for the separate /api/users/:id/roles assignment path.
 */
const ROLE_RANK: Record<RoleName, number> = {
  [RoleName.SUPER_ADMIN]: 100,
  [RoleName.ADMIN]: 90,
  [RoleName.FINANCE]: 50,
  [RoleName.OPERATIONS]: 50,
  [RoleName.SALES]: 50,
  [RoleName.RESERVATIONS]: 50,
  [RoleName.MARKETING]: 50,
  [RoleName.SUPPORT]: 40,
  [RoleName.SUPPLIER]: 20,
  [RoleName.AGENT]: 20,
  [RoleName.API]: 10,
  [RoleName.CUSTOMER]: 0,
};

/** -1 (not 0) for an empty/unrecognized role list, so a roleless actor ranks below even CUSTOMER (0) and can assign nothing. */
export function highestRank(roleNames: readonly RoleName[]): number {
  return roleNames.reduce((max, name) => Math.max(max, ROLE_RANK[name] ?? 0), -1);
}

/**
 * True only if the actor holds at least one role whose rank is >= the
 * target role's rank. An unrecognized target role name fails closed
 * (Infinity — never assignable by anyone) rather than defaulting to
 * assignable.
 */
export function canAssignRole(actorRoleNames: readonly RoleName[], targetRoleName: RoleName): boolean {
  const targetRank = ROLE_RANK[targetRoleName] ?? Infinity;
  return highestRank(actorRoleNames) >= targetRank;
}
