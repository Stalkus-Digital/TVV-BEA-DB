import type { ReactNode } from "react";

/** Hierarchy v2 APIs — runtime only; requires HIERARCHY_DATABASE_URL when called. */
export const dynamic = "force-dynamic";

export default function ApiV2Layout({ children }: { children: ReactNode }) {
  return children;
}
