import { PermissionAction, PermissionResource } from "../types/permission";
import { RoleName } from "../types/role";

export function permissionKey(resource: PermissionResource, action: PermissionAction): string {
  return `${resource}:${action}`;
}

/** Granular CRUD × 11 resources = 44 permissions, seeded once at module registration. */
export const PERMISSION_SEED_DATA: { resource: PermissionResource; action: PermissionAction; description: string }[] = Object.values(
  PermissionResource
).flatMap((resource) =>
  Object.values(PermissionAction).map((action) => ({
    resource,
    action,
    description: `${action[0]}${action.slice(1).toLowerCase()} ${resource.toLowerCase()} records`,
  }))
);

const ALL_ACTIONS = Object.values(PermissionAction);
const READ_ONLY: PermissionAction[] = [PermissionAction.READ];

function grant(resource: PermissionResource, actions: PermissionAction[] = ALL_ACTIONS): string[] {
  return actions.map((action) => permissionKey(resource, action));
}

/**
 * Role → permission-key grants. Mirrors real module ownership (docs/02's
 * Module Ownership section) the same way docs/17's smaller 4-role sketch
 * did, extended to all 12 roles this sprint names. SUPER_ADMIN/ADMIN differ
 * deliberately: ADMIN gets full business-resource access plus limited
 * Users management, but not ROLES/SETTINGS administration — that stays
 * SUPER_ADMIN-only, since restructuring the permission system itself is a
 * different order of risk than running the business day-to-day.
 *
 * Known gap, flagged not hidden: CUSTOMER/AGENT/SUPPLIER grants below are
 * resource-level only ("can read QUOTE"), not row-level ("can read only
 * THEIR OWN quotes") — row-level scoping isn't implemented this sprint (see
 * docs/22's Remaining TODOs). Every grant here is a ceiling, not a
 * per-record guarantee.
 */
export const ROLE_PERMISSION_MATRIX: Record<RoleName, string[]> = {
  [RoleName.SUPER_ADMIN]: Object.values(PermissionResource).flatMap((r) => grant(r)),
  [RoleName.ADMIN]: [
    ...Object.values(PermissionResource)
      .filter((r) => r !== PermissionResource.ROLES && r !== PermissionResource.SETTINGS)
      .flatMap((r) => grant(r)),
    ...grant(PermissionResource.USERS, [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE]),
    ...grant(PermissionResource.ROLES, READ_ONLY),
    ...grant(PermissionResource.SETTINGS, READ_ONLY),
  ],
  [RoleName.SALES]: [
    ...grant(PermissionResource.QUOTE),
    ...grant(PermissionResource.BOOKING, [PermissionAction.CREATE, PermissionAction.READ]),
    ...grant(PermissionResource.PACKAGE, READ_ONLY),
    ...grant(PermissionResource.DESTINATION, READ_ONLY),
    ...grant(PermissionResource.INVENTORY, READ_ONLY),
    ...grant(PermissionResource.WEBSITE, READ_ONLY),
  ],
  [RoleName.RESERVATIONS]: [
    ...grant(PermissionResource.BOOKING, [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE]),
    ...grant(PermissionResource.QUOTE, READ_ONLY),
    ...grant(PermissionResource.PACKAGE, READ_ONLY),
    ...grant(PermissionResource.INVENTORY, READ_ONLY),
    ...grant(PermissionResource.DESTINATION, READ_ONLY),
  ],
  [RoleName.OPERATIONS]: [
    ...grant(PermissionResource.INVENTORY),
    ...grant(PermissionResource.PACKAGE),
    ...grant(PermissionResource.DESTINATION),
    ...grant(PermissionResource.BOOKING, [PermissionAction.READ, PermissionAction.UPDATE]),
    ...grant(PermissionResource.QUOTE, READ_ONLY),
  ],
  [RoleName.FINANCE]: [
    ...grant(PermissionResource.BOOKING, [PermissionAction.READ, PermissionAction.UPDATE]),
    ...grant(PermissionResource.QUOTE, READ_ONLY),
    ...grant(PermissionResource.PACKAGE, READ_ONLY),
  ],
  [RoleName.SUPPORT]: [
    ...grant(PermissionResource.QUOTE, READ_ONLY),
    ...grant(PermissionResource.BOOKING, READ_ONLY),
    ...grant(PermissionResource.USERS, READ_ONLY),
  ],
  // AUTH-003: MARKETING resource grant added so this role keeps the
  // /api/marketing/* access it already had under the old fail-closed
  // default (CMS access via WEBSITE was already full CRUD and needed no
  // change). AI is deliberately not granted here — nothing about this
  // role's existing scope (website content, marketing) implies package
  // generation, so it stays minimum-required rather than carried forward
  // just because the old default happened to allow it.
  [RoleName.MARKETING]: [
    ...grant(PermissionResource.WEBSITE),
    ...grant(PermissionResource.MARKETING),
    ...grant(PermissionResource.DESTINATION, READ_ONLY),
    ...grant(PermissionResource.PACKAGE, READ_ONLY),
  ],
  [RoleName.SUPPLIER]: [...grant(PermissionResource.INVENTORY, READ_ONLY), ...grant(PermissionResource.BOOKING, READ_ONLY)],
  [RoleName.AGENT]: [
    ...grant(PermissionResource.QUOTE, [PermissionAction.CREATE, PermissionAction.READ]),
    ...grant(PermissionResource.PACKAGE, READ_ONLY),
    ...grant(PermissionResource.DESTINATION, READ_ONLY),
    ...grant(PermissionResource.BOOKING, READ_ONLY),
  ],
  [RoleName.CUSTOMER]: [...grant(PermissionResource.QUOTE, READ_ONLY), ...grant(PermissionResource.BOOKING, READ_ONLY)],
  [RoleName.API]: Object.values(PermissionResource).flatMap((r) => grant(r, READ_ONLY)),
};
