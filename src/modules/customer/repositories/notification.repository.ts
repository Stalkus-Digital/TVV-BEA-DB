import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { Notification } from "../types/notification";

/**
 * Minimal by design — placeholder model per this sprint's explicit
 * instruction ("Create placeholder models only. Do not implement
 * email/SMS/WhatsApp yet."). Only what `/api/me/dashboard`'s unread-count
 * needs; not a full notification-center repository.
 */
export interface NotificationRepository {
  countUnread(userId: string): Promise<Result<number, AppError>>;
}
