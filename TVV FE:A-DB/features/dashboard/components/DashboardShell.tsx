"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sessionActions, useAuth } from "@/features/auth";
import { dashboardPaths } from "../paths";

interface DashboardShellProps {
  children: ReactNode;
}

const NAV = [
  { href: dashboardPaths.home, label: "Overview", match: (path: string) => path === dashboardPaths.home },
  {
    href: dashboardPaths.bookings,
    label: "My bookings",
    match: (path: string) => path.startsWith(dashboardPaths.bookings),
  },
  {
    href: dashboardPaths.quotes,
    label: "My quotes",
    match: (path: string) => path.startsWith(dashboardPaths.quotes),
  },
  {
    href: dashboardPaths.wishlist,
    label: "Wishlist",
    match: (path: string) => path.startsWith(dashboardPaths.wishlist),
  },
  {
    href: dashboardPaths.profile,
    label: "Profile",
    match: (path: string) => path.startsWith(dashboardPaths.profile),
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, status, hydrated } = useAuth();
  const pathname = usePathname() ?? dashboardPaths.home;
  const router = useRouter();

  useEffect(() => {
    if (hydrated && status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, status, pathname, router]);

  if (!hydrated || status !== "authenticated") {
    return (
      <main className="min-h-screen bg-cream pt-32">
        <div className="mx-auto max-w-md px-6">
          <p className="text-[14px] text-ink-secondary">Loading your account…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-section pt-32">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 lg:grid-cols-[220px,1fr]">
        <aside>
          <p className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">Signed in as</p>
          <p className="mt-1 truncate font-display text-[18px] text-ink">{user?.name ?? user?.email}</p>
          <nav className="mt-8 space-y-1" aria-label="Dashboard navigation">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block min-h-11 rounded-md px-3 py-2 text-[14px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                    active
                      ? "bg-ink/10 font-medium text-ink"
                      : "text-ink-secondary hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                sessionActions.logout();
                router.replace("/");
              }}
              className="mt-4 block min-h-11 w-full rounded-md px-3 py-2 text-left text-[14px] text-ink-secondary hover:bg-ink/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Sign out
            </button>
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}
