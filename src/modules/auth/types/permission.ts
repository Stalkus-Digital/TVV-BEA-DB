/**
 * Granular CRUD per resource. The original 9 resources are per this
 * sprint's brief. WEBSITE started "reserved but inert" (/api/website/*
 * itself stays unauthenticated) but is no longer inert — AUTH-003 maps
 * /api/cms/* to it, since that's exactly the "future admin-side
 * website-content-management surface" this resource was reserved for.
 * MARKETING and AI were added in AUTH-003 to close a real gap: /api/
 * marketing/* and /api/admin/ai/* had no dedicated resource and fell back
 * to "any authenticated identity" under the fail-closed default in
 * middleware/route-permission-map.ts.
 */
export const PermissionResource = {
  INVENTORY: "INVENTORY",
  DESTINATION: "DESTINATION",
  PACKAGE: "PACKAGE",
  WEBSITE: "WEBSITE",
  QUOTE: "QUOTE",
  BOOKING: "BOOKING",
  USERS: "USERS",
  ROLES: "ROLES",
  SETTINGS: "SETTINGS",
  MARKETING: "MARKETING",
  AI: "AI",
} as const;

export type PermissionResource = (typeof PermissionResource)[keyof typeof PermissionResource];

export const PermissionAction = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];

/** key is the canonical "RESOURCE:ACTION" identifier (e.g. "INVENTORY:CREATE") — what role-permission checks actually compare against. */
export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  key: string;
  description: string;
  createdAt: string;
}
