"use client";

import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AuthGate } from "@/features/admin-auth/components/AuthGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthGate>{children}</AuthGate>
    </QueryProvider>
  );
}
