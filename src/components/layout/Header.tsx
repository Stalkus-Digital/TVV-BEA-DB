"use client";

import { Bell, Loader2, LogOut, Search, User } from "lucide-react";
import { useAdminLogoutMutation } from "@/features/admin-auth/hooks/useAdminLogoutMutation";
import { useAdminAuth } from "@/features/admin-auth/store/session";

function userInitials(email: string, fullName: string | null): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function Header() {
  const { user } = useAdminAuth();
  const logoutMutation = useAdminLogoutMutation();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, packages, leads..."
            className="w-full bg-muted/50 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <button className="p-2 hover:bg-muted rounded-full transition-colors relative" type="button">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-card" />
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-foreground leading-tight">
                {user.fullName ?? user.email}
              </div>
              <div className="text-[11px] text-muted-foreground">{user.roles[0]?.replace(/_/g, " ")}</div>
            </div>
            <div
              className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold"
              title={user.email}
            >
              {userInitials(user.email, user.fullName)}
            </div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Sign out"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {!user && (
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    </header>
  );
}
