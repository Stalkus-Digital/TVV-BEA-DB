import { ok, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { NotificationRepository } from "./notification.repository";

export class PrismaNotificationRepository implements NotificationRepository {
  async countUnread(userId: string): Promise<Result<number, AppError>> {
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return ok(count);
  }
}
