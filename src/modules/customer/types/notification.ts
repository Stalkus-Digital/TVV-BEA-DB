export const NotificationType = {
  QUOTE_UPDATE: "QUOTE_UPDATE",
  BOOKING_UPDATE: "BOOKING_UPDATE",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Placeholder only, per this sprint's explicit instruction — no
 * email/SMS/WhatsApp delivery exists yet. Nothing in this codebase writes
 * a Notification row today; the type and repository exist so
 * `/api/me/dashboard`'s "unread notifications" field has a real (always
 * zero, for now) source instead of a hardcoded literal.
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}
