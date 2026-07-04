import type { AppError } from "@/shared/errors";
import { err, mapResult, type PaginatedResult, type Result } from "@/shared/types";
import { UnauthorizedError, ValidationError } from "@/shared/errors";
import { getSessionService, getUserService } from "../module";
import type { AuthContext } from "../types/auth-context";
import type { Session } from "../types/session";
import type { ListUsersQuery } from "./dto";
import { toPublicUser, type PublicUser } from "./user.transformer";

export async function listUsersHandler(query: ListUsersQuery): Promise<Result<PaginatedResult<PublicUser>, AppError>> {
  const result = await getUserService().list(query);
  return mapResult(result, (paginated) => ({ ...paginated, items: paginated.items.map(toPublicUser) }));
}

export async function getUserHandler(id: string): Promise<Result<PublicUser, AppError>> {
  const result = await getUserService().getById(id);
  return mapResult(result, toPublicUser);
}

export async function createUserHandler(body: unknown, context: AuthContext | null): Promise<Result<PublicUser, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>).roleId !== "string") {
    return err(new ValidationError("roleId is required"));
  }
  const { roleId, ...userInput } = body as Record<string, unknown> & { roleId: string };
  const result = await getUserService().create(userInput, roleId, context.userId);
  return mapResult(result, toPublicUser);
}

export async function updateUserHandler(id: string, body: unknown): Promise<Result<PublicUser, AppError>> {
  const result = await getUserService().update(id, body);
  return mapResult(result, toPublicUser);
}

export async function deactivateUserHandler(id: string): Promise<Result<PublicUser, AppError>> {
  const result = await getUserService().deactivate(id);
  return mapResult(result, toPublicUser);
}

export async function assignRoleHandler(userId: string, body: unknown, context: AuthContext | null): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>).roleId !== "string") {
    return err(new ValidationError("roleId is required"));
  }
  return getUserService().assignRole(userId, (body as Record<string, string>).roleId, context.userId);
}

export async function revokeRoleHandler(userId: string, roleId: string, context: AuthContext | null): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getUserService().revokeRole(userId, roleId, context.userId);
}

export async function listUserSessionsHandler(userId: string): Promise<Result<Session[], AppError>> {
  return getSessionService().listByUser(userId);
}

export async function revokeUserSessionHandler(sessionId: string): Promise<Result<Session, AppError>> {
  return getSessionService().revoke(sessionId);
}
