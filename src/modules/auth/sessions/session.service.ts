import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { Session } from "../types/session";
import type { SessionRepository } from "../repositories/session.repository";

export interface CreateSessionInput {
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  rememberMe: boolean;
  ttlSeconds: number;
}

/** Owns Session records only — token issuance/rotation lives in services/auth.service.ts, which calls this for the session half of a login/refresh. */
export class SessionService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly sessions: SessionRepository
  ) {
    super(context);
  }

  async create(input: CreateSessionInput): Promise<Result<Session, AppError>> {
    const now = new Date().toISOString();
    this.logger.info("Creating session", { userId: input.userId, rememberMe: input.rememberMe, ipAddress: input.ipAddress });
    return this.sessions.create({
      userId: input.userId,
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      rememberMe: input.rememberMe,
      expiresAt: new Date(Date.now() + input.ttlSeconds * 1000).toISOString(),
      revokedAt: null,
      lastActivityAt: now,
      createdAt: now,
    });
  }

  async getById(id: string): Promise<Result<Session, AppError>> {
    const result = await this.sessions.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Session "${id}" not found`));
    return ok(result.value);
  }

  async listByUser(userId: string): Promise<Result<Session[], AppError>> {
    return this.sessions.findByUser(userId);
  }

  async touch(id: string): Promise<Result<Session, AppError>> {
    return this.sessions.update(id, { lastActivityAt: new Date().toISOString() });
  }

  async revoke(id: string): Promise<Result<Session, AppError>> {
    this.logger.info("Revoking session", { id });
    return this.sessions.update(id, { revokedAt: new Date().toISOString() });
  }

  isValid(session: Session, now: Date = new Date()): boolean {
    if (session.revokedAt) return false;
    return new Date(session.expiresAt).getTime() > now.getTime();
  }
}
