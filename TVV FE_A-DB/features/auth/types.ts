export type { CustomerUser } from "@/lib/api/auth";
export type { LoginFormValues, RegisterFormValues, ForgotPasswordFormValues } from "./schemas";

export type AuthStatus = "anonymous" | "authenticated" | "loading";

export interface AuthSession {
  user: import("@/lib/api/auth").CustomerUser | null;
  status: AuthStatus;
  hydrated: boolean;
}
