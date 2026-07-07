"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import { isSolidNavRoute } from "@/lib/nav-variant";

/**
 * Header chip that shows "Sign in" for guests and the customer's initial for
 * authenticated users. Client-only — renders nothing during SSR to avoid a
 * hydration mismatch.
 */
export function AccountLink() {
  const { user, status, hydrated } = useAuth();
  const pathname = usePathname() ?? "";
  const solid = isSolidNavRoute(pathname);

  if (!hydrated) {
    return <span className="hidden lg:block w-20" aria-hidden />;
  }

  if (status === "authenticated" && user) {
    const initial = (user.name?.[0] ?? user.email[0]).toUpperCase();
    return (
      <Link
        href="/dashboard"
        className={cn(
          "hidden lg:flex items-center gap-2 text-[13px] font-medium transition-colors",
          solid ? "text-ink/80 hover:text-ink" : "text-white/80 hover:text-white",
        )}
      >
        <span
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs",
            solid ? "bg-ink/10" : "bg-white/15",
          )}
        >
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{user.name ?? "Account"}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        "hidden lg:inline-flex items-center gap-2 text-[13px] font-medium transition-colors",
        solid ? "text-ink/70 hover:text-ink" : "text-white/70 hover:text-white",
      )}
    >
      <User className="h-4 w-4" aria-hidden />
      <span>Sign in</span>
    </Link>
  );
}
