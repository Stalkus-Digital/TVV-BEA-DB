import { randomBytes, createHash } from "node:crypto";
import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, type AppError } from "@/shared/errors";
import { EmailService } from "@/modules/email/email.service";
import { AuditEventType } from "../types/audit-log";
import { LoginEventType } from "../types/login-history";
import { RoleName } from "../types/role";
import type { User } from "../types/user";
import type { UserRepository } from "../repositories/user.repository";
import type { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import type { LoginHistoryRepository } from "../repositories/login-history.repository";
import type { PasswordResetRepository } from "../repositories/password-reset.repository";
import type { EmailVerificationRepository } from "../repositories/email-verification.repository";
import { hashPassword, verifyPassword } from "./password.service";
import { isAccountLocked, recordFailedAttempt, resetLockState } from "./login-attempt-policy";
import {
  validateChangePassword,
  validateLogin,
  validateRegister,
  validateRequestPasswordReset,
  validateResendVerification,
  validateResetPassword,
  validateVerifyEmail,
} from "../validation/auth.validation";
import type { RoleService } from "../roles/role.service";
import type { PermissionService } from "../permissions/permission.service";
import type { SessionService } from "../sessions/session.service";
import type { AuditLogService } from "../audit/audit-log.service";
import type { JwtService } from "../jwt/jwt.service";
import type { AuthConfigService } from "./auth-config.service";

export interface RequestContext {
  ipAddress: string | null;
  deviceInfo: string | null;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; fullName: string; emailVerified: boolean };
  roles: RoleName[];
}

export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

function selectorValidatorPair(): { validator: string; hash: string } {
  const validator = randomBytes(32).toString("hex");
  return { validator, hash: createHash("sha256").update(validator).digest("hex") };
}

/**
 * The one orchestrator every auth API handler calls into. Owns the full
 * login/refresh/logout/password lifecycle; Session/Role/Permission/Audit
 * concerns are each their own service (constructor-injected), same
 * composition style as Booking's own orchestrator depending on
 * BookingPaymentService/BookingTimelineService/etc.
 */
export class AuthService extends BaseService {
  private readonly emailService: EmailService;

  constructor(
    context: ServiceContext,
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly loginHistory: LoginHistoryRepository,
    private readonly passwordResets: PasswordResetRepository,
    private readonly emailVerifications: EmailVerificationRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly sessionService: SessionService,
    private readonly auditLogService: AuditLogService,
    private readonly jwt: JwtService,
    private readonly config: AuthConfigService
  ) {
    super(context);
    this.emailService = new EmailService(context);
  }

  /** Public self-service signup — always assigns CUSTOMER. Internal staff accounts are created via POST /api/users (admin-gated, see user.service.ts), not here. */
  async register(input: unknown): Promise<Result<User, AppError>> {
    const validated = validateRegister(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const existing = await this.users.findByEmail(value.email);
    if (isErr(existing)) return existing;
    if (existing.value) return err(new ConflictError(`Email "${value.email}" is already registered`));

    const passwordHash = await hashPassword(value.password);
    const now = new Date().toISOString();
    const created = await this.users.create({
      email: value.email,
      passwordHash,
      fullName: value.fullName,
      isActive: true,
      emailVerifiedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
    if (isErr(created)) return created;

    const customerRole = await this.roleService.getByName(RoleName.CUSTOMER);
    if (isErr(customerRole)) return customerRole;
    await this.roleService.assignToUser(created.value.id, customerRole.value.id);

    await this.issueAndSendVerificationEmail(created.value);

    await this.auditLogService.record({
      eventType: AuditEventType.USER_CREATED,
      actorUserId: created.value.id,
      targetUserId: created.value.id,
      details: { email: value.email, source: "self-registration" },
    });
    this.logger.info("User registered", { userId: created.value.id, email: value.email });
    return ok(created.value);
  }

  async login(input: unknown, requestContext: RequestContext): Promise<Result<LoginResult, AppError>> {
    const validated = validateLogin(input);
    if (isErr(validated)) return validated;
    const { email, password, rememberMe } = validated.value;

    const userResult = await this.users.findByEmail(email);
    if (isErr(userResult)) return userResult;
    const user = userResult.value;

    if (!user) {
      await this.recordLoginAttempt(null, email, LoginEventType.FAILED_UNKNOWN_EMAIL, requestContext);
      return err(new UnauthorizedError("Invalid email or password"));
    }

    if (isAccountLocked(user.lockedUntil)) {
      await this.recordLoginAttempt(user.id, email, LoginEventType.FAILED_LOCKED, requestContext);
      return err(new ForbiddenError(`Account is locked until ${user.lockedUntil}`));
    }

    if (!user.isActive) {
      await this.recordLoginAttempt(user.id, email, LoginEventType.FAILED_INACTIVE, requestContext);
      return err(new ForbiddenError("Account is inactive"));
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      const lockState = recordFailedAttempt(
        { failedLoginAttempts: user.failedLoginAttempts, lockedUntil: user.lockedUntil },
        this.config.get("maxFailedLoginAttempts"),
        this.config.get("accountLockDurationSeconds")
      );
      await this.users.update(user.id, { ...lockState, updatedAt: new Date().toISOString() });
      await this.recordLoginAttempt(user.id, email, LoginEventType.FAILED_PASSWORD, requestContext);
      return err(new UnauthorizedError("Invalid email or password"));
    }

    const roles = await this.roleService.getRolesForUser(user.id);
    if (isErr(roles)) return roles;
    const isCustomerOnly = roles.value.some((r) => r.name === RoleName.CUSTOMER) && !roles.value.some((r) => r.name !== RoleName.CUSTOMER);
    if (isCustomerOnly && !user.emailVerifiedAt) {
      await this.recordLoginAttempt(user.id, email, LoginEventType.FAILED_INACTIVE, requestContext);
      return err(
        new ForbiddenError("Please verify your email before signing in", {
          code: EMAIL_NOT_VERIFIED,
          email: user.email,
        })
      );
    }

    await this.users.update(user.id, { ...resetLockState(), lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.recordLoginAttempt(user.id, email, LoginEventType.SUCCESS, requestContext);
    await this.auditLogService.record({ eventType: AuditEventType.LOGIN, actorUserId: user.id, ipAddress: requestContext.ipAddress });

    return this.issueTokens(user, rememberMe, requestContext);
  }

  async logout(sessionId: string, actorUserId: string): Promise<Result<void, AppError>> {
    const revoked = await this.sessionService.revoke(sessionId);
    if (isErr(revoked)) return revoked;

    const sessionTokens = await this.refreshTokens.findBySession(sessionId);
    if (!isErr(sessionTokens)) {
      for (const token of sessionTokens.value) {
        if (!token.revokedAt) await this.refreshTokens.update(token.id, { revokedAt: new Date().toISOString() });
      }
    }

    await this.auditLogService.record({ eventType: AuditEventType.LOGOUT, actorUserId });
    this.logger.info("User logged out", { sessionId, actorUserId });
    return ok(undefined);
  }

  /** Rotates the refresh token on every use; reuse of an already-rotated-out token revokes the entire session (theft mitigation). */
  async refresh(rawRefreshToken: string, requestContext: RequestContext): Promise<Result<LoginResult, AppError>> {
    const [tokenId, validator] = rawRefreshToken.split(".");
    if (!tokenId || !validator) return err(new UnauthorizedError("Malformed refresh token"));

    const tokenResult = await this.refreshTokens.findById(tokenId);
    if (isErr(tokenResult)) return tokenResult;
    const token = tokenResult.value;
    if (!token) return err(new UnauthorizedError("Invalid refresh token"));

    const suppliedHash = createHash("sha256").update(validator).digest("hex");
    if (suppliedHash !== token.tokenHash) return err(new UnauthorizedError("Invalid refresh token"));

    if (token.revokedAt) {
      await this.sessionService.revoke(token.sessionId);
      this.logger.warn("Refresh token reuse detected — session revoked", { sessionId: token.sessionId, tokenId });
      return err(new UnauthorizedError("Refresh token has been revoked"));
    }
    if (new Date(token.expiresAt).getTime() < Date.now()) return err(new UnauthorizedError("Refresh token expired"));

    const session = await this.sessionService.getById(token.sessionId);
    if (isErr(session)) return session;
    if (!this.sessionService.isValid(session.value)) return err(new UnauthorizedError("Session is no longer valid"));

    const userResult = await this.users.findById(token.userId);
    if (isErr(userResult)) return userResult;
    if (!userResult.value || !userResult.value.isActive) return err(new UnauthorizedError("Account is no longer active"));

    await this.sessionService.touch(session.value.id);
    const rotated = await this.issueTokens(userResult.value, session.value.rememberMe, requestContext, session.value.id);
    if (isErr(rotated)) return rotated;

    const newRefreshTokenId = rotated.value.refreshToken.split(".")[0];
    await this.refreshTokens.update(token.id, { revokedAt: new Date().toISOString(), replacedByTokenId: newRefreshTokenId });

    return rotated;
  }

  async changePassword(userId: string, input: unknown): Promise<Result<void, AppError>> {
    const validated = validateChangePassword(input);
    if (isErr(validated)) return validated;

    const userResult = await this.users.findById(userId);
    if (isErr(userResult)) return userResult;
    if (!userResult.value) return err(new NotFoundError(`User "${userId}" not found`));

    const currentValid = await verifyPassword(validated.value.currentPassword, userResult.value.passwordHash);
    if (!currentValid) return err(new UnauthorizedError("Current password is incorrect"));

    const passwordHash = await hashPassword(validated.value.newPassword);
    await this.users.update(userId, { passwordHash, updatedAt: new Date().toISOString() });
    this.logger.info("Password changed", { userId });
    return ok(undefined);
  }

  async requestPasswordReset(input: unknown): Promise<Result<void, AppError>> {
    const validated = validateRequestPasswordReset(input);
    if (isErr(validated)) return validated;

    const userResult = await this.users.findByEmail(validated.value.email);
    if (isErr(userResult)) return userResult;

    if (userResult.value) {
      const { validator, hash } = selectorValidatorPair();
      const created = await this.passwordResets.create({
        userId: userResult.value.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + this.config.get("passwordResetTtlSeconds") * 1000).toISOString(),
        usedAt: null,
        createdAt: new Date().toISOString(),
      });
      if (isErr(created)) return created;

      const rawToken = `${created.value.id}.${validator}`;
      const resetUrl = `${this.config.get("frontendUrl").replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;
      const sent = await this.emailService.sendPasswordReset(userResult.value.email, resetUrl);
      if (isErr(sent)) {
        this.logger.warn("Password reset email failed to send — token logged for recovery", {
          userId: userResult.value.id,
          resetToken: rawToken,
        });
      }
    }

    return ok(undefined);
  }

  async resetPassword(input: unknown): Promise<Result<void, AppError>> {
    const validated = validateResetPassword(input);
    if (isErr(validated)) return validated;

    const [resetId, validator] = validated.value.token.split(".");
    if (!resetId || !validator) return err(new UnauthorizedError("Invalid or expired reset token"));

    const resetResult = await this.passwordResets.findById(resetId);
    if (isErr(resetResult)) return resetResult;
    const reset = resetResult.value;
    if (!reset) return err(new UnauthorizedError("Invalid or expired reset token"));

    const suppliedHash = createHash("sha256").update(validator).digest("hex");
    if (suppliedHash !== reset.tokenHash) return err(new UnauthorizedError("Invalid or expired reset token"));
    if (reset.usedAt) return err(new UnauthorizedError("This reset token has already been used"));
    if (new Date(reset.expiresAt).getTime() < Date.now()) return err(new UnauthorizedError("This reset token has expired"));

    const passwordHash = await hashPassword(validated.value.newPassword);
    await this.users.update(reset.userId, { passwordHash, updatedAt: new Date().toISOString() });
    await this.passwordResets.update(reset.id, { usedAt: new Date().toISOString() });
    await this.auditLogService.record({ eventType: AuditEventType.PASSWORD_RESET, actorUserId: reset.userId });

    this.logger.info("Password reset completed", { userId: reset.userId });
    return ok(undefined);
  }

  async verifyEmail(input: unknown): Promise<Result<{ email: string }, AppError>> {
    const validated = validateVerifyEmail(input);
    if (isErr(validated)) return validated;

    const [verificationId, validator] = validated.value.token.split(".");
    if (!verificationId || !validator) return err(new UnauthorizedError("Invalid or expired verification token"));

    const verificationResult = await this.emailVerifications.findById(verificationId);
    if (isErr(verificationResult)) return verificationResult;
    const verification = verificationResult.value;
    if (!verification) return err(new UnauthorizedError("Invalid or expired verification token"));

    const suppliedHash = createHash("sha256").update(validator).digest("hex");
    if (suppliedHash !== verification.tokenHash) return err(new UnauthorizedError("Invalid or expired verification token"));
    if (verification.usedAt) return err(new UnauthorizedError("This verification token has already been used"));
    if (new Date(verification.expiresAt).getTime() < Date.now()) return err(new UnauthorizedError("This verification token has expired"));

    const now = new Date().toISOString();
    const updated = await this.users.update(verification.userId, { emailVerifiedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;
    await this.emailVerifications.update(verification.id, { usedAt: now });

    this.logger.info("Email verified", { userId: verification.userId });
    return ok({ email: updated.value.email });
  }

  async resendVerification(input: unknown): Promise<Result<void, AppError>> {
    const validated = validateResendVerification(input);
    if (isErr(validated)) return validated;

    const userResult = await this.users.findByEmail(validated.value.email);
    if (isErr(userResult)) return userResult;

    if (userResult.value && !userResult.value.emailVerifiedAt) {
      await this.issueAndSendVerificationEmail(userResult.value);
    }

    return ok(undefined);
  }

  async getMeProfile(userId: string): Promise<Result<{ fullName: string; emailVerified: boolean }, AppError>> {
    const userResult = await this.users.findById(userId);
    if (isErr(userResult)) return userResult;
    if (!userResult.value) return err(new NotFoundError(`User "${userId}" not found`));
    return ok({
      fullName: userResult.value.fullName,
      emailVerified: Boolean(userResult.value.emailVerifiedAt),
    });
  }

  private async issueAndSendVerificationEmail(user: User): Promise<void> {
    const { validator, hash } = selectorValidatorPair();
    const created = await this.emailVerifications.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + this.config.get("emailVerificationTtlSeconds") * 1000).toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    });
    if (isErr(created)) {
      this.logger.error("Failed to create email verification token", { userId: user.id, error: created.error });
      return;
    }

    const rawToken = `${created.value.id}.${validator}`;
    const verifyUrl = `${this.config.get("frontendUrl").replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(rawToken)}`;
    const sent = await this.emailService.sendEmailVerification(user.email, verifyUrl);
    if (isErr(sent)) {
      this.logger.warn("Verification email failed to send — token logged for recovery", {
        userId: user.id,
        verificationToken: rawToken,
      });
    }
  }

  private async issueTokens(user: User, rememberMe: boolean, requestContext: RequestContext, existingSessionId?: string): Promise<Result<LoginResult, AppError>> {
    const ttlSeconds = rememberMe ? this.config.get("refreshTokenRememberMeTtlSeconds") : this.config.get("refreshTokenTtlSeconds");

    let sessionId = existingSessionId;
    if (!sessionId) {
      const created = await this.sessionService.create({
        userId: user.id,
        deviceInfo: requestContext.deviceInfo,
        ipAddress: requestContext.ipAddress,
        rememberMe,
        ttlSeconds,
      });
      if (isErr(created)) return created;
      sessionId = created.value.id;
    }

    const roles = await this.roleService.getRolesForUser(user.id);
    if (isErr(roles)) return roles;
    const roleNames = roles.value.map((r) => r.name);

    const accessTokenTtl = this.config.get("accessTokenTtlSeconds");
    const accessToken = this.jwt.issue({ sub: user.id, email: user.email, sessionId, roles: roleNames }, accessTokenTtl);

    const { validator, hash } = selectorValidatorPair();
    const refreshTokenRecord = await this.refreshTokens.create({
      userId: user.id,
      sessionId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: new Date().toISOString(),
    });
    if (isErr(refreshTokenRecord)) return refreshTokenRecord;

    return ok({
      accessToken,
      refreshToken: `${refreshTokenRecord.value.id}.${validator}`,
      expiresIn: accessTokenTtl,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: Boolean(user.emailVerifiedAt),
      },
      roles: roleNames,
    });
  }

  private async recordLoginAttempt(
    userId: string | null,
    email: string,
    eventType: (typeof LoginEventType)[keyof typeof LoginEventType],
    requestContext: RequestContext
  ): Promise<void> {
    await this.loginHistory.create({
      userId,
      email,
      eventType,
      ipAddress: requestContext.ipAddress,
      deviceInfo: requestContext.deviceInfo,
      occurredAt: new Date().toISOString(),
    });
    if (eventType !== LoginEventType.SUCCESS) {
      await this.auditLogService.record({
        eventType: AuditEventType.FAILED_LOGIN,
        actorUserId: userId,
        details: { email, reason: eventType },
        ipAddress: requestContext.ipAddress,
      });
    }
  }
}
