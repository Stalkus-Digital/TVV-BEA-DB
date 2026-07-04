/**
 * Public surface of the Auth Platform — same discipline as every other
 * module: repository and service classes stay internal, only types, API
 * handlers, and accessor functions are exported. middleware/ is exported
 * too (unusual for this project) because src/middleware.ts, at the Next.js
 * root, is this module's one legitimate external consumer of its
 * request-resolution logic — it is not a business module reaching in.
 */
export * from "./types";
export * from "./api";
export * from "./middleware";
export {
  ensureAuthModuleSeeded,
  getApiKeyService,
  getAuditLogService,
  getAuthService,
  getJwtService,
  getPermissionService,
  getRoleService,
  getSessionService,
  getUserService,
} from "./module";
