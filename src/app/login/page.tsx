import { Suspense } from "react";
import { LoginForm } from "@/features/admin-auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
