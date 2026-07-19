import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { RoleName } from "./types/role";
import type {
  ApiKeyRepository,
  AuditLogRepository,
  EmailVerificationRepository,
  LoginHistoryRepository,
  PasswordResetRepository,
  PermissionRepository,
  RefreshTokenRepository,
  RoleRepository,
  SessionRepository,
  UserRepository,
  UserRoleRepository,
} from "./repositories";
import { PrismaApiKeyRepository } from "./repositories/api-key.repository.prisma";
import { PrismaAuditLogRepository } from "./repositories/audit-log.repository.prisma";
import { PrismaEmailVerificationRepository } from "./repositories/email-verification.repository.prisma";
import { PrismaLoginHistoryRepository } from "./repositories/login-history.repository.prisma";
import { PrismaPasswordResetRepository } from "./repositories/password-reset.repository.prisma";
import { PrismaPermissionRepository } from "./repositories/permission.repository.prisma";
import { PrismaRefreshTokenRepository } from "./repositories/refresh-token.repository.prisma";
import { PrismaRoleRepository } from "./repositories/role.repository.prisma";
import { PrismaSessionRepository } from "./repositories/session.repository.prisma";
import { PrismaUserRepository } from "./repositories/user.repository.prisma";
import { PrismaUserRoleRepository } from "./repositories/user-role.repository.prisma";
import { JwtService } from "./jwt/jwt.service";
import { SessionService } from "./sessions/session.service";
import { RoleService } from "./roles/role.service";
import { PermissionService } from "./permissions/permission.service";
import { AuditLogService } from "./audit/audit-log.service";
import { AuthConfigService } from "./services/auth-config.service";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { ApiKeyService } from "./services/api-key.service";
import { hashPassword } from "./services/password.service";

export const USER_REPOSITORY_TOKEN = createToken<UserRepository>("auth.repository.user");
export const ROLE_REPOSITORY_TOKEN = createToken<RoleRepository>("auth.repository.role");
export const PERMISSION_REPOSITORY_TOKEN = createToken<PermissionRepository>("auth.repository.permission");
export const USER_ROLE_REPOSITORY_TOKEN = createToken<UserRoleRepository>("auth.repository.userRole");
export const SESSION_REPOSITORY_TOKEN = createToken<SessionRepository>("auth.repository.session");
export const REFRESH_TOKEN_REPOSITORY_TOKEN = createToken<RefreshTokenRepository>("auth.repository.refreshToken");
export const LOGIN_HISTORY_REPOSITORY_TOKEN = createToken<LoginHistoryRepository>("auth.repository.loginHistory");
export const PASSWORD_RESET_REPOSITORY_TOKEN = createToken<PasswordResetRepository>("auth.repository.passwordReset");
export const EMAIL_VERIFICATION_REPOSITORY_TOKEN = createToken<EmailVerificationRepository>("auth.repository.emailVerification");
export const AUDIT_LOG_REPOSITORY_TOKEN = createToken<AuditLogRepository>("auth.repository.auditLog");
export const API_KEY_REPOSITORY_TOKEN = createToken<ApiKeyRepository>("auth.repository.apiKey");

export const JWT_SERVICE_TOKEN = createToken<JwtService>("auth.service.jwt");
export const SESSION_SERVICE_TOKEN = createToken<SessionService>("auth.service.session");
export const ROLE_SERVICE_TOKEN = createToken<RoleService>("auth.service.role");
export const PERMISSION_SERVICE_TOKEN = createToken<PermissionService>("auth.service.permission");
export const AUDIT_LOG_SERVICE_TOKEN = createToken<AuditLogService>("auth.service.auditLog");
export const AUTH_SERVICE_TOKEN = createToken<AuthService>("auth.service.auth");
export const USER_SERVICE_TOKEN = createToken<UserService>("auth.service.user");
export const API_KEY_SERVICE_TOKEN = createToken<ApiKeyService>("auth.service.apiKey");

/**
 * Auth Platform — secures every other module's HTTP surface via
 * src/middleware.ts, but is never imported BY any business module (the
 * dependency arrow points one way: middleware/routes depend on Auth, Auth
 * depends on nothing business-specific). No `src/modules/{inventory,
 * supplier,destination,package,website,quote,booking}` file changed to
 * build this — grep-verified.
 */
export const authModule: ModuleDefinition = {
  name: "auth",
  register(c) {
    c.registerFactory(USER_REPOSITORY_TOKEN, () => new PrismaUserRepository());
    c.registerFactory(ROLE_REPOSITORY_TOKEN, () => new PrismaRoleRepository());
    c.registerFactory(PERMISSION_REPOSITORY_TOKEN, () => new PrismaPermissionRepository());
    c.registerFactory(USER_ROLE_REPOSITORY_TOKEN, () => new PrismaUserRoleRepository());
    c.registerFactory(SESSION_REPOSITORY_TOKEN, () => new PrismaSessionRepository());
    c.registerFactory(REFRESH_TOKEN_REPOSITORY_TOKEN, () => new PrismaRefreshTokenRepository());
    c.registerFactory(LOGIN_HISTORY_REPOSITORY_TOKEN, () => new PrismaLoginHistoryRepository());
    c.registerFactory(PASSWORD_RESET_REPOSITORY_TOKEN, () => new PrismaPasswordResetRepository());
    c.registerFactory(EMAIL_VERIFICATION_REPOSITORY_TOKEN, () => new PrismaEmailVerificationRepository());
    c.registerFactory(AUDIT_LOG_REPOSITORY_TOKEN, () => new PrismaAuditLogRepository());
    c.registerFactory(API_KEY_REPOSITORY_TOKEN, () => new PrismaApiKeyRepository());

    c.registerFactory(JWT_SERVICE_TOKEN, () => new JwtService(AuthConfigService.getInstance().get("jwtSecret")));
    c.registerFactory(SESSION_SERVICE_TOKEN, () => new SessionService({ logger: createLogger("auth.session") }, c.resolve(SESSION_REPOSITORY_TOKEN)));
    c.registerFactory(ROLE_SERVICE_TOKEN, () => new RoleService({ logger: createLogger("auth.role") }, c.resolve(ROLE_REPOSITORY_TOKEN), c.resolve(USER_ROLE_REPOSITORY_TOKEN)));
    c.registerFactory(PERMISSION_SERVICE_TOKEN, () => new PermissionService({ logger: createLogger("auth.permission") }, c.resolve(PERMISSION_REPOSITORY_TOKEN)));
    c.registerFactory(AUDIT_LOG_SERVICE_TOKEN, () => new AuditLogService({ logger: createLogger("auth.audit") }, c.resolve(AUDIT_LOG_REPOSITORY_TOKEN)));
    c.registerFactory(
      API_KEY_SERVICE_TOKEN,
      () => new ApiKeyService({ logger: createLogger("auth.apiKey") }, c.resolve(API_KEY_REPOSITORY_TOKEN), c.resolve(ROLE_SERVICE_TOKEN))
    );
    c.registerFactory(
      USER_SERVICE_TOKEN,
      () => new UserService({ logger: createLogger("auth.user") }, c.resolve(USER_REPOSITORY_TOKEN), c.resolve(ROLE_SERVICE_TOKEN), c.resolve(AUDIT_LOG_SERVICE_TOKEN))
    );
    c.registerFactory(
      AUTH_SERVICE_TOKEN,
      () =>
        new AuthService(
          { logger: createLogger("auth.service") },
          c.resolve(USER_REPOSITORY_TOKEN),
          c.resolve(REFRESH_TOKEN_REPOSITORY_TOKEN),
          c.resolve(LOGIN_HISTORY_REPOSITORY_TOKEN),
          c.resolve(PASSWORD_RESET_REPOSITORY_TOKEN),
          c.resolve(EMAIL_VERIFICATION_REPOSITORY_TOKEN),
          c.resolve(ROLE_SERVICE_TOKEN),
          c.resolve(PERMISSION_SERVICE_TOKEN),
          c.resolve(SESSION_SERVICE_TOKEN),
          c.resolve(AUDIT_LOG_SERVICE_TOKEN),
          c.resolve(JWT_SERVICE_TOKEN),
          AuthConfigService.getInstance()
        )
    );
  },
};

class AuthModuleHealthCheck implements HealthCheck {
  readonly name = "auth";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(authModule.name)) {
  moduleRegistry.registerModule(authModule);
  authModule.register(container);
  healthCheckRegistry.register(new AuthModuleHealthCheck());
}

export function getJwtService(): JwtService {
  return container.resolve(JWT_SERVICE_TOKEN);
}
export function getSessionService(): SessionService {
  return container.resolve(SESSION_SERVICE_TOKEN);
}
export function getRoleService(): RoleService {
  return container.resolve(ROLE_SERVICE_TOKEN);
}
export function getPermissionService(): PermissionService {
  return container.resolve(PERMISSION_SERVICE_TOKEN);
}
export function getAuditLogService(): AuditLogService {
  return container.resolve(AUDIT_LOG_SERVICE_TOKEN);
}
export function getAuthService(): AuthService {
  return container.resolve(AUTH_SERVICE_TOKEN);
}
export function getUserService(): UserService {
  return container.resolve(USER_SERVICE_TOKEN);
}
export function getApiKeyService(): ApiKeyService {
  return container.resolve(API_KEY_SERVICE_TOKEN);
}

const BOOTSTRAP_ADMIN_EMAIL = "admin@tvv-travel-os.local";
const BOOTSTRAP_ADMIN_PASSWORD = "ChangeMe123!";

/**
 * Seeds the 12 system roles, 36 permissions, and one bootstrap SUPER_ADMIN
 * user — without this, there is no way to create the first admin account
 * (a classic auth-system chicken-and-egg problem). Idempotent and
 * promise-cached so every caller (src/middleware.ts on every request, plus
 * a defensive call in api/auth.handlers.ts) awaits the same in-flight
 * seeding rather than re-triggering it — cheap after the first resolution.
 *
 * SECURITY: the bootstrap password is a well-known, intentionally-published
 * default — same "insecure-by-design local default, must be rotated before
 * any real deployment" pattern as AUTH_JWT_SECRET's default in
 * auth-config.service.ts. It MUST be changed via POST /api/auth/change-password
 * before this system is exposed to anything beyond local development.
 */
let seedPromise: Promise<void> | null = null;
export function ensureAuthModuleSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await getRoleService().ensureSeeded();
      await getPermissionService().ensureSeeded();

      const users = container.resolve(USER_REPOSITORY_TOKEN);
      const existingAdmin = await users.findByEmail(BOOTSTRAP_ADMIN_EMAIL);
      const forceReset = process.env.BOOTSTRAP_ADMIN_RESET === "true";

      if (existingAdmin.ok && existingAdmin.value) {
        if (!forceReset) return;

        const passwordHash = await hashPassword(BOOTSTRAP_ADMIN_PASSWORD);
        const now = new Date().toISOString();
        await users.update(existingAdmin.value.id, {
          passwordHash,
          isActive: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
          emailVerifiedAt: existingAdmin.value.emailVerifiedAt ?? now,
          updatedAt: now,
        });
        const superAdminRole = await getRoleService().getByName(RoleName.SUPER_ADMIN);
        if (superAdminRole.ok) {
          await getRoleService().assignToUser(existingAdmin.value.id, superAdminRole.value.id);
        }
        createLogger("auth.bootstrap").warn("Bootstrap SUPER_ADMIN password reset via BOOTSTRAP_ADMIN_RESET", {
          email: BOOTSTRAP_ADMIN_EMAIL,
        });
        return;
      }

      const passwordHash = await hashPassword(BOOTSTRAP_ADMIN_PASSWORD);
      const now = new Date().toISOString();
      const created = await users.create({
        email: BOOTSTRAP_ADMIN_EMAIL,
        passwordHash,
        fullName: "System Administrator",
        isActive: true,
        emailVerifiedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      });
      if (!created.ok) return;

      const superAdminRole = await getRoleService().getByName(RoleName.SUPER_ADMIN);
      if (superAdminRole.ok) await getRoleService().assignToUser(created.value.id, superAdminRole.value.id);

      createLogger("auth.bootstrap").warn("Bootstrap SUPER_ADMIN account created with a well-known default password — change it before any non-local deployment", {
        email: BOOTSTRAP_ADMIN_EMAIL,
      });
    })();
  }
  return seedPromise;
}

void ensureAuthModuleSeeded();
