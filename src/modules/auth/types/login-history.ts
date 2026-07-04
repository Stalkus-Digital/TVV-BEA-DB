export const LoginEventType = {
  SUCCESS: "SUCCESS",
  FAILED_PASSWORD: "FAILED_PASSWORD",
  FAILED_LOCKED: "FAILED_LOCKED",
  FAILED_INACTIVE: "FAILED_INACTIVE",
  FAILED_UNKNOWN_EMAIL: "FAILED_UNKNOWN_EMAIL",
} as const;

export type LoginEventType = (typeof LoginEventType)[keyof typeof LoginEventType];

/** userId is null when the attempted email doesn't match any account — the attempt is still recorded (by email), just not attributable to a real user. */
export interface LoginHistory {
  id: string;
  userId: string | null;
  email: string;
  eventType: LoginEventType;
  ipAddress: string | null;
  deviceInfo: string | null;
  occurredAt: string;
}
