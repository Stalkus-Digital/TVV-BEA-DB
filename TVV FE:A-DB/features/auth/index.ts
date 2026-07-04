export { AuthLayout } from "./components/AuthLayout";
export { AuthField } from "./components/AuthField";
export { AuthErrorAlert } from "./components/AuthErrorAlert";
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { AccountShell } from "./components/AccountShell";

export { useAuth, sessionActions, authActions } from "./store/session";
export type { CustomerUser } from "./store/session";

export { useLoginMutation } from "./hooks/useLoginMutation";
export { useRegisterMutation } from "./hooks/useRegisterMutation";
export { useForgotPasswordMutation } from "./hooks/useForgotPasswordMutation";
export { useCustomerQuery, useInvalidateCustomer } from "./hooks/useCustomerQuery";

export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type ForgotPasswordFormValues,
} from "./schemas";

export type { AuthSession, AuthStatus } from "./types";
