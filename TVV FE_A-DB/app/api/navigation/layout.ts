import type { ReactNode } from "react";

/** Hierarchy nav API — skip static generation at build (Postgres optional on Vercel). */
export const dynamic = "force-dynamic";

export default function NavigationApiLayout({ children }: { children: ReactNode }) {
  return children;
}
