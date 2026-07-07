"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminAuth } from "../store/session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, hydrated } = useAdminAuth();
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!hydrated) return;

    if (isLoginRoute && status === "authenticated") {
      router.replace("/");
      return;
    }

    if (!isLoginRoute && status === "anonymous") {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, isLoginRoute, pathname, router, status]);

  if (!hydrated || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Redirecting to login" />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
